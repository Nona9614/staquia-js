// Node JS
import assert from "node:assert";
// Structures
import Staquia from "../../../src/entities/staquia.js";
import Spec from "../../structures/test-spec.js";
import LexicalItem from "../../../src/lists/lexical-item.js";
import LexicalList from "../../../src/lists/lexical-list.js";
// Errors
import LexicalError from "../../../src/errors/lexical-error.js";
// Results
import { Result } from "../../../src/result.js";
// Decorators
import setup from "../../decorators/setup.decorator.js";
import test from "../../decorators/test.decorator.js";

interface Item {
  id: number;
  position: string;
}

type List = LexicalList<number, Item>;

/** Unwraps a successful result or throws the contained error. */
const assert_ok = <T>(result: Result<T, unknown>): T => {
  if (!result.ok) throw result.error instanceof Error ? result.error : Error(String(result.error));
  return result.value;
};

/** Verifies that a result failed with a `LexicalError` of the expected type. */
const assert_lexical_error = (result: Result<unknown, unknown>, type: LexicalError["type"]) => {
  if (result.ok) throw Error(`A failure of type '${type}' was expected but the operation succeeded.`);
  assert.ok(result.error instanceof LexicalError, "The error is not an instance of 'LexicalError'.");
  assert.equal(result.error.type, type);
};

/**
 * Verifies the full integrity of the doubly linked list against the expected order of ids:
 * - `size`, `first()` and `last()` match.
 * - Walking forward through `next` yields the expected ids.
 * - Walking backward through `previous` yields the reversed ids.
 * - `toArray()` and `at()` agree with the expected order.
 * - The head has no `previous`, the tail has no `next`.
 * - Positions are strictly increasing and mirrored into the wrapped object.
 */
const assert_links = (sut: List, ids: number[]) => {
  assert.equal(sut.size, ids.length, "The size of the list does not match.");

  if (ids.length === 0) {
    assert.equal(sut.first(), undefined, "An empty list must not have a first item.");
    assert.equal(sut.last(), undefined, "An empty list must not have a last item.");
    assert.deepEqual(assert_ok(sut.toArray()), []);
    return;
  }

  assert.equal(sut.first()?.id, ids[0], "The first item does not match.");
  assert.equal(sut.last()?.id, ids[ids.length - 1], "The last item does not match.");
  assert.equal(sut.first()?.previous, undefined, "The first item must not have a previous item.");
  assert.equal(sut.last()?.next, undefined, "The last item must not have a next item.");

  // Forward traversal
  const forward: number[] = [];
  let walker = sut.first();
  while (walker && forward.length <= ids.length) {
    forward.push(walker.id);
    walker = walker.next === undefined ? undefined : sut.find(walker.next);
  }
  assert.deepEqual(forward, ids, "Forward traversal does not match.");

  // Backward traversal
  const backward: number[] = [];
  walker = sut.last();
  while (walker && backward.length <= ids.length) {
    backward.push(walker.id);
    walker = walker.previous === undefined ? undefined : sut.find(walker.previous);
  }
  assert.deepEqual(backward, [...ids].reverse(), "Backward traversal does not match.");

  // Array and index access
  const array = assert_ok(sut.toArray());
  assert.deepEqual(
    array.map((i) => i.id),
    ids,
    "The array representation does not match.",
  );
  ids.forEach((id, index) => assert.equal(assert_ok(sut.at(index))?.id, id, `The item at index ${index} does not match.`));

  // Positions must be strictly increasing, both as strings (lexical order) and through `compare`
  for (let i = 1; i < array.length; i++) {
    const left = array[i - 1]!.position.toString();
    const right = array[i]!.position.toString();
    assert.ok(left < right, `The position string '${left}' (id: ${array[i - 1]!.id}) must sort before '${right}' (id: ${array[i]!.id}).`);
    const order = array[i - 1]!.position.compare(array[i]!.position);
    assert.equal(
      order,
      "less",
      `The position '${array[i - 1]!.position}' (id: ${array[i - 1]!.id}) must be less than '${array[i]!.position}' (id: ${array[i]!.id}).`,
    );
  }
};

export default class LexicalListTests extends Spec {
  #system = Staquia.create("!", "a", "z", 4, 12, 0.15);

  constructor() {
    super("Lexical List", "Integration Test");
  }

  @setup
  init() {}

  /** Creates a new list with items pushed using the passed ids. */
  #create(...ids: number[]): List {
    const sut = new LexicalList<number, Item>(this.#system);
    for (const id of ids) assert_ok(sut.push({ id, position: "" }));
    return sut;
  }

  /** Returns the string representation of the position at the given offset from the start. */
  #position(offset: number): string {
    let position = assert_ok(this.#system.start());
    for (let i = 0; i < offset; i++) position = assert_ok(this.#system.next(position));
    return position.toString();
  }

  // ---------------------------------------------------------------------------
  // Empty list
  // ---------------------------------------------------------------------------

  @test("A new list should be empty.", "empty")
  lexical_list_new_is_empty() {
    const sut = new LexicalList<number, Item>(this.#system);
    assert_links(sut, []);
    assert.equal(sut.selected(), undefined);
    assert.equal(assert_ok(sut.at(0)), undefined);
  }

  // ---------------------------------------------------------------------------
  // Push
  // ---------------------------------------------------------------------------

  @test("Should push a single item to an empty list.", "push")
  lexical_list_push_item_to_empty_list() {
    // Arrange
    const sut = new LexicalList<number, Item>(this.#system);
    const value: Item = { id: 1, position: "" };

    // Act
    const item = assert_ok(sut.push(value));

    // Assert
    assert.equal(item.id, 1);
    assert.equal(item.position.toString(), this.#position(0));
    assert.equal(value.position, this.#position(0), "The position must be written back into the wrapped object.");
    assert.equal(item.previous, undefined);
    assert.equal(item.next, undefined);
    assert.equal(sut.first(), item);
    assert.equal(sut.last(), item);
    assert_links(sut, [1]);
  }

  @test("Should push multiple items, linking them in both directions.", "push")
  lexical_list_push_multiple_items() {
    // Arrange
    const sut = new LexicalList<number, Item>(this.#system);

    // Act
    const item1 = assert_ok(sut.push({ id: 1, position: "" }));
    const item2 = assert_ok(sut.push({ id: 2, position: "" }));
    const item3 = assert_ok(sut.push({ id: 3, position: "" }));

    // Assert
    assert.equal(item1.previous, undefined);
    assert.equal(item1.next, 2);
    assert.equal(item2.previous, 1);
    assert.equal(item2.next, 3);
    assert.equal(item3.previous, 2);
    assert.equal(item3.next, undefined);
    assert.equal(item1.position.toString(), this.#position(0));
    assert.equal(item2.position.toString(), this.#position(1));
    assert.equal(item3.position.toString(), this.#position(2));
    assert_links(sut, [1, 2, 3]);
  }

  @test("Should ignore the incoming position and always append at the tail.", "push")
  lexical_list_push_ignores_incoming_position() {
    const sut = this.#create(1);
    const item = assert_ok(sut.push({ id: 2, position: "aaaa" }));
    assert.equal(item.position.toString(), this.#position(1));
    assert_links(sut, [1, 2]);
  }

  @test("Should push many items keeping the list consistent.", "push")
  lexical_list_push_many_items() {
    const ids = Array.from({ length: 50 }, (_, i) => i + 1);
    const sut = this.#create(...ids);
    assert_links(sut, ids);
  }

  @test("Should reject items with a null or undefined id.", "push")
  lexical_list_push_invalid_id() {
    const sut = this.#create(1);
    assert_lexical_error(sut.push({ id: undefined as any, position: "" }), "invalid-id");
    assert_lexical_error(sut.push({ id: null as any, position: "" }), "invalid-id");
    assert_links(sut, [1]);
    assert.equal(sut.find(undefined), undefined);
    assert.equal(sut.find(null), undefined);
  }

  // ---------------------------------------------------------------------------
  // Unshift
  // ---------------------------------------------------------------------------

  @test("Should unshift a single item to an empty list.", "unshift")
  lexical_list_unshift_item_to_empty_list() {
    // Arrange
    const sut = new LexicalList<number, Item>(this.#system);
    const value: Item = { id: 1, position: "" };

    // Act
    const item = assert_ok(sut.unshift(value));

    // Assert
    assert.equal(item.id, 1);
    assert.equal(item.position.toString(), this.#position(0));
    assert.equal(value.position, this.#position(0), "The position must be written back into the wrapped object.");
    assert.equal(item.previous, undefined);
    assert.equal(item.next, undefined);
    assert.equal(sut.first(), item);
    assert.equal(sut.last(), item);
    assert_links(sut, [1]);
  }

  @test("Should unshift multiple items, linking them in both directions.", "unshift")
  lexical_list_unshift_multiple_items() {
    // Arrange
    const sut = new LexicalList<number, Item>(this.#system);

    // Act
    const item1 = assert_ok(sut.unshift({ id: 1, position: "" }));
    const item2 = assert_ok(sut.unshift({ id: 2, position: "" }));
    const item3 = assert_ok(sut.unshift({ id: 3, position: "" }));

    // Assert
    assert.equal(item3.previous, undefined);
    assert.equal(item3.next, 2);
    assert.equal(item2.previous, 3);
    assert.equal(item2.next, 1);
    assert.equal(item1.previous, 2);
    assert.equal(item1.next, undefined);
    assert_links(sut, [3, 2, 1]);
  }

  @test("Should ignore the incoming position and always insert at the head.", "unshift")
  lexical_list_unshift_ignores_incoming_position() {
    const sut = this.#create(1);
    const item = assert_ok(sut.unshift({ id: 2, position: "zzzz" }));
    assert.equal(item.position.toString(), assert_ok(this.#system.previous(sut.find(1)!.position)).toString());
    assert_links(sut, [2, 1]);
  }

  @test("Should unshift many items keeping the list consistent.", "unshift")
  lexical_list_unshift_many_items() {
    const sut = new LexicalList<number, Item>(this.#system);
    const ids = Array.from({ length: 50 }, (_, i) => i + 1);
    for (const id of ids) assert_ok(sut.unshift({ id, position: "" }));
    assert_links(sut, [...ids].reverse());
  }

  @test("Should mix push and unshift keeping the list consistent.", "unshift")
  lexical_list_unshift_and_push() {
    const sut = new LexicalList<number, Item>(this.#system);
    assert_ok(sut.push({ id: 1, position: "" }));
    assert_ok(sut.unshift({ id: 2, position: "" }));
    assert_ok(sut.push({ id: 3, position: "" }));
    assert_ok(sut.unshift({ id: 4, position: "" }));
    assert_links(sut, [4, 2, 1, 3]);
  }

  @test("Should keep unshifting after the first item is deleted or moved.", "unshift")
  lexical_list_unshift_after_mutations() {
    const sut = this.#create(1, 2, 3);
    assert_ok(sut.delete(1));
    assert_ok(sut.unshift({ id: 4, position: "" }));
    assert_links(sut, [4, 2, 3]);
    assert_ok(sut.move(3, undefined, 4));
    assert_ok(sut.unshift({ id: 5, position: "" }));
    assert_links(sut, [5, 3, 4, 2]);
  }

  @test("Should accept unshifted items after the list was emptied.", "unshift")
  lexical_list_unshift_after_emptied() {
    const sut = this.#create(1);
    assert_ok(sut.delete(1));
    assert_ok(sut.unshift({ id: 2, position: "" }));
    assert_ok(sut.unshift({ id: 3, position: "" }));
    assert_links(sut, [3, 2]);
  }

  @test("Should reject unshifted items with a null or undefined id.", "unshift")
  lexical_list_unshift_invalid_id() {
    const sut = this.#create(1);
    assert_lexical_error(sut.unshift({ id: undefined as any, position: "" }), "invalid-id");
    assert_lexical_error(sut.unshift({ id: null as any, position: "" }), "invalid-id");
    assert_links(sut, [1]);
  }

  // ---------------------------------------------------------------------------
  // Head
  // ---------------------------------------------------------------------------

  /** Verifies that `head()` is the position right before the first item. */
  #assert_head(sut: List) {
    const first = sut.first()!.position;
    const head = assert_ok(sut.head());
    assert.equal(head.toString(), assert_ok(this.#system.previous(first)).toString(), "The head must be the previous position of the first item.");
    assert.equal(head.compare(first), "less", "The head must be less than the first item.");
    assert.ok(head.toString() < first.toString(), "The head string must sort before the first item.");
  }

  @test("The head of an empty list should be the start position.", "head")
  lexical_list_head_of_empty_list() {
    const sut = new LexicalList<number, Item>(this.#system);
    assert.equal(assert_ok(sut.head()).toString(), this.#position(0));
  }

  @test("The head should be the position before the first item.", "head")
  lexical_list_head_before_first() {
    const sut = this.#create(1, 2);
    this.#assert_head(sut);
  }

  @test("The head should be before a single item.", "head")
  lexical_list_head_single_item() {
    const sut = this.#create(1);
    this.#assert_head(sut);
  }

  @test("The head should be based on the positions given to set.", "head")
  lexical_list_head_after_set() {
    const sut = new LexicalList<number, Item>(this.#system);
    assert_ok(sut.set([
      { id: 1, position: "bbbb" },
      { id: 2, position: "cccc" },
    ]));
    this.#assert_head(sut);
  }

  @test("The head should follow the new first item after a delete.", "head")
  lexical_list_head_after_delete() {
    const sut = this.#create(1, 2, 3);
    assert_ok(sut.delete(1));
    assert_links(sut, [2, 3]);
    this.#assert_head(sut);
  }

  @test("The head should follow the new first item after moves.", "head")
  lexical_list_head_after_move() {
    const sut = this.#create(1, 2, 3);
    assert_ok(sut.move(3, undefined, 1));
    assert_links(sut, [3, 1, 2]);
    this.#assert_head(sut);
    assert_ok(sut.move(3, 2, undefined));
    assert_links(sut, [1, 2, 3]);
    this.#assert_head(sut);
  }

  @test("The head should not modify the list.", "head")
  lexical_list_head_is_read_only() {
    const sut = this.#create(1, 2, 3);
    const before = assert_ok(sut.toArray()).map((i) => i.position.toString());
    assert_ok(sut.head());
    assert_ok(sut.head());
    assert_links(sut, [1, 2, 3]);
    assert.deepEqual(
      assert_ok(sut.toArray()).map((i) => i.position.toString()),
      before,
    );
  }

  // ---------------------------------------------------------------------------
  // Tail
  // ---------------------------------------------------------------------------

  /** Verifies that `tail()` is the position right after the last item. */
  #assert_tail(sut: List) {
    const last = sut.last()!.position;
    const tail = assert_ok(sut.tail());
    assert.equal(tail.toString(), assert_ok(this.#system.next(last)).toString(), "The tail must be the next position of the last item.");
    assert.equal(last.compare(tail), "less", "The tail must be greater than the last item.");
    assert.ok(last.toString() < tail.toString(), "The tail string must sort after the last item.");
  }

  @test("The tail of an empty list should be the start position.", "tail")
  lexical_list_tail_of_empty_list() {
    const sut = new LexicalList<number, Item>(this.#system);
    assert.equal(assert_ok(sut.tail()).toString(), this.#position(0));
  }

  @test("The tail should be the position after the last item.", "tail")
  lexical_list_tail_after_last() {
    const sut = this.#create(1, 2);
    assert.equal(assert_ok(sut.tail()).toString(), this.#position(2));
    this.#assert_tail(sut);
  }

  @test("The tail should be after a single item.", "tail")
  lexical_list_tail_single_item() {
    const sut = this.#create(1);
    this.#assert_tail(sut);
  }

  @test("The tail should be based on the positions given to set.", "tail")
  lexical_list_tail_after_set() {
    const sut = new LexicalList<number, Item>(this.#system);
    assert_ok(sut.set([
      { id: 1, position: "bbbb" },
      { id: 2, position: "cccc" },
    ]));
    this.#assert_tail(sut);
  }

  @test("The tail should follow the new last item after a delete.", "tail")
  lexical_list_tail_after_delete() {
    const sut = this.#create(1, 2, 3);
    assert_ok(sut.delete(3));
    assert_links(sut, [1, 2]);
    this.#assert_tail(sut);
  }

  @test("The tail should follow the new last item after moves.", "tail")
  lexical_list_tail_after_move() {
    const sut = this.#create(1, 2, 3);
    assert_ok(sut.move(1, 3, undefined));
    assert_links(sut, [2, 3, 1]);
    this.#assert_tail(sut);
    assert_ok(sut.move(1, undefined, 2));
    assert_links(sut, [1, 2, 3]);
    this.#assert_tail(sut);
  }

  @test("The tail should not modify the list.", "tail")
  lexical_list_tail_is_read_only() {
    const sut = this.#create(1, 2, 3);
    const before = assert_ok(sut.toArray()).map((i) => i.position.toString());
    assert_ok(sut.tail());
    assert_ok(sut.tail());
    assert_links(sut, [1, 2, 3]);
    assert.deepEqual(
      assert_ok(sut.toArray()).map((i) => i.position.toString()),
      before,
    );
  }

  // ---------------------------------------------------------------------------
  // Find & Select
  // ---------------------------------------------------------------------------

  @test("Should find existing items and return undefined for missing ones.", "find")
  lexical_list_find() {
    const sut = this.#create(1, 2, 3);
    assert.equal(sut.find(2)?.id, 2);
    assert.equal(sut.find(4), undefined);
    assert.equal(sut.find(undefined), undefined);
    assert.equal(sut.find(null), undefined);
  }

  @test("Should select an item and clear the selection with a missing id.", "find")
  lexical_list_select() {
    const sut = this.#create(1, 2, 3);
    sut.select(2);
    assert.equal(sut.selected(), sut.find(2));
    sut.select(4);
    assert.equal(sut.selected(), undefined);
    sut.select(1);
    sut.select(null);
    assert.equal(sut.selected(), undefined);
  }

  // ---------------------------------------------------------------------------
  // At
  // ---------------------------------------------------------------------------

  @test("Should return the item at the given index.", "at")
  lexical_list_at() {
    const sut = this.#create(10, 20, 30);
    assert.equal(assert_ok(sut.at(0))?.id, 10);
    assert.equal(assert_ok(sut.at(1))?.id, 20);
    assert.equal(assert_ok(sut.at(2))?.id, 30);
    assert.equal(assert_ok(sut.at("1"))?.id, 20, "Numeric strings must be supported.");
  }

  @test("Should return undefined for invalid or out of bounds indexes.", "at")
  lexical_list_at_out_of_bounds() {
    const sut = this.#create(10, 20, 30);
    assert.equal(assert_ok(sut.at(3)), undefined);
    assert.equal(assert_ok(sut.at(-1)), undefined);
    assert.equal(assert_ok(sut.at("abc")), undefined);
    assert.equal(assert_ok(sut.at(null)), undefined);
    assert.equal(assert_ok(sut.at(undefined)), undefined);
  }

  // ---------------------------------------------------------------------------
  // Delete
  // ---------------------------------------------------------------------------

  @test("Should fail to delete an item that does not exist.", "delete")
  lexical_list_delete_missing() {
    const sut = this.#create(1, 2);
    assert_lexical_error(sut.delete(3), "not-found");
    assert_lexical_error(sut.delete(undefined), "not-found");
    assert_links(sut, [1, 2]);
  }

  @test("Should fail to delete using a null id.", "delete")
  lexical_list_delete_null_id() {
    const sut = this.#create(1, 2);
    assert_lexical_error(sut.delete(null), "not-found");
    assert_links(sut, [1, 2]);
  }

  @test("Should delete the only item leaving the list empty.", "delete")
  lexical_list_delete_only_item() {
    const sut = this.#create(1);
    assert_ok(sut.delete(1));
    assert_links(sut, []);
  }

  @test("Should delete the first item and promote the next one as first.", "delete")
  lexical_list_delete_first() {
    const sut = this.#create(1, 2, 3);
    assert_ok(sut.delete(1));
    assert_links(sut, [2, 3]);
  }

  @test("Should delete the last item and promote the previous one as last.", "delete")
  lexical_list_delete_last() {
    const sut = this.#create(1, 2, 3);
    assert_ok(sut.delete(3));
    assert_links(sut, [1, 2]);
  }

  @test("Should delete a middle item and link its neighbors.", "delete")
  lexical_list_delete_middle() {
    const sut = this.#create(1, 2, 3);
    assert_ok(sut.delete(2));
    assert_links(sut, [1, 3]);
  }

  @test("Should delete every item one by one.", "delete")
  lexical_list_delete_all() {
    const sut = this.#create(1, 2, 3, 4, 5);
    const remaining = [1, 2, 3, 4, 5];
    for (const id of [3, 1, 5, 2, 4]) {
      assert_ok(sut.delete(id));
      remaining.splice(remaining.indexOf(id), 1);
      assert_links(sut, remaining);
    }
  }

  @test("Should not delete the same item twice.", "delete")
  lexical_list_delete_twice() {
    const sut = this.#create(1, 2);
    assert_ok(sut.delete(1));
    assert_lexical_error(sut.delete(1), "not-found");
    assert_links(sut, [2]);
  }

  @test("Should keep appending after the new last item once the tail is deleted.", "delete")
  lexical_list_push_after_delete() {
    const sut = this.#create(1, 2, 3);
    assert_ok(sut.delete(3));
    const item = assert_ok(sut.push({ id: 4, position: "" }));
    assert.equal(item.position.toString(), this.#position(2));
    assert_links(sut, [1, 2, 4]);
  }

  @test("Should accept new items after the list was emptied.", "delete")
  lexical_list_push_after_emptied() {
    const sut = this.#create(1, 2);
    assert_ok(sut.delete(1));
    assert_ok(sut.delete(2));
    assert_ok(sut.push({ id: 3, position: "" }));
    assert_ok(sut.push({ id: 4, position: "" }));
    assert_links(sut, [3, 4]);
  }

  // ---------------------------------------------------------------------------
  // Move
  // ---------------------------------------------------------------------------

  @test("Should fail to move an item that does not exist.", "move")
  lexical_list_move_missing() {
    const sut = this.#create(1, 2);
    assert_lexical_error(sut.move(3, 1, 2), "not-found");
    assert_links(sut, [1, 2]);
  }

  @test("Should fail to move when no neighbor is provided.", "move")
  lexical_list_move_without_neighbors() {
    const sut = this.#create(1, 2);
    assert_lexical_error(sut.move(1), "position");
    assert_lexical_error(sut.move(1, null, null), "position");
    assert_links(sut, [1, 2]);
  }

  @test("Should fail to move when a provided neighbor does not exist.", "move")
  lexical_list_move_missing_neighbor() {
    const sut = this.#create(1, 2, 3);
    assert_lexical_error(sut.move(1, 5, 6), "not-found");
    assert_lexical_error(sut.move(1, 3, 6), "not-found");
    assert_lexical_error(sut.move(3, 5, 1), "not-found");
    assert_links(sut, [1, 2, 3]);
  }

  @test("Should fail to move an item next to itself.", "move")
  lexical_list_move_next_to_itself() {
    const sut = this.#create(1, 2, 3);
    assert_lexical_error(sut.move(2, 2, 3), "not-adjacent");
    assert_lexical_error(sut.move(2, 1, 2), "not-adjacent");
    assert_links(sut, [1, 2, 3]);
  }

  @test("Should fail to move between two items that are not adjacent.", "move")
  lexical_list_move_not_adjacent() {
    const sut = this.#create(1, 2, 3, 4);
    const before = assert_ok(sut.toArray()).map((i) => i.position.toString());
    assert_lexical_error(sut.move(4, 1, 3), "not-adjacent");
    assert_lexical_error(sut.move(1, 4, 2), "not-adjacent");
    assert_lexical_error(sut.move(2, 3, 1), "not-adjacent");
    assert_links(sut, [1, 2, 3, 4]);
    assert.deepEqual(
      assert_ok(sut.toArray()).map((i) => i.position.toString()),
      before,
      "A failed move must not change any position.",
    );
  }

  @test("Should fail to move to an end when the single neighbor is not at that end.", "move")
  lexical_list_move_single_neighbor_not_at_end() {
    const sut = this.#create(1, 2, 3);
    assert_lexical_error(sut.move(3, 1, undefined), "not-adjacent");
    assert_lexical_error(sut.move(1, undefined, 3), "not-adjacent");
    assert_links(sut, [1, 2, 3]);
  }

  @test("Should accept neighbors that are only adjacent once the item is unlinked.", "move")
  lexical_list_move_adjacent_after_unlink() {
    // 1 and 3 are only adjacent because 2 sits between them.
    const sut = this.#create(1, 2, 3, 4);
    assert_ok(sut.move(2, 3, 4));
    assert_links(sut, [1, 3, 2, 4]);
    // 2 is the first item only because 1 is the item being moved.
    const other = this.#create(1, 2, 3);
    assert_ok(other.move(1, 3, undefined));
    assert_links(other, [2, 3, 1]);
  }

  @test("Should not change anything when moving an item to its current place.", "move")
  lexical_list_move_same_place() {
    const sut = this.#create(1, 2, 3);
    const position = sut.find(2)!.position.toString();
    assert_ok(sut.move(2, 1, 3));
    assert_ok(sut.move(1, undefined, 2));
    assert_ok(sut.move(3, 2, undefined));
    assert.equal(sut.find(2)!.position.toString(), position, "The position must not change.");
    assert_links(sut, [1, 2, 3]);
  }

  @test("Should treat null neighbor ids as no neighbor.", "move")
  lexical_list_move_null_neighbors() {
    const sut = this.#create(1, 2, 3);
    assert_ok(sut.move(3, null, 1));
    assert_links(sut, [3, 1, 2]);
    assert_ok(sut.move(3, 2, null));
    assert_links(sut, [1, 2, 3]);
  }

  @test("Should move the last item to the front.", "move")
  lexical_list_move_last_to_front() {
    const sut = this.#create(1, 2, 3);
    const item = assert_ok(sut.move(3, undefined, 1));
    assert.equal(item.previous, undefined);
    assert.equal(item.next, 1);
    assert_links(sut, [3, 1, 2]);
  }

  @test("Should move the first item to the end.", "move")
  lexical_list_move_first_to_end() {
    const sut = this.#create(1, 2, 3);
    const item = assert_ok(sut.move(1, 3, undefined));
    assert.equal(item.previous, 3);
    assert.equal(item.next, undefined);
    assert_links(sut, [2, 3, 1]);
  }

  @test("Should move the first item between two others.", "move")
  lexical_list_move_first_to_middle() {
    const sut = this.#create(1, 2, 3);
    assert_ok(sut.move(1, 2, 3));
    assert_links(sut, [2, 1, 3]);
  }

  @test("Should move the last item between two others.", "move")
  lexical_list_move_last_to_middle() {
    const sut = this.#create(1, 2, 3);
    assert_ok(sut.move(3, 1, 2));
    assert_links(sut, [1, 3, 2]);
  }

  @test("Should move a middle item to both ends.", "move")
  lexical_list_move_middle_to_ends() {
    const sut = this.#create(1, 2, 3, 4);
    assert_ok(sut.move(2, undefined, 1));
    assert_links(sut, [2, 1, 3, 4]);
    assert_ok(sut.move(3, 4, undefined));
    assert_links(sut, [2, 1, 4, 3]);
  }

  @test("Should swap two items in a list of two.", "move")
  lexical_list_move_swap_pair() {
    const sut = this.#create(1, 2);
    assert_ok(sut.move(2, undefined, 1));
    assert_links(sut, [2, 1]);
    assert_ok(sut.move(2, 1, undefined));
    assert_links(sut, [1, 2]);
  }

  @test("Should keep the list consistent after many consecutive moves.", "move")
  lexical_list_move_many() {
    const sut = this.#create(1, 2, 3, 4, 5);
    const expected = [1, 2, 3, 4, 5];
    const moves: [number, number | undefined, number | undefined][] = [
      [5, undefined, 1],
      [1, 4, undefined],
      [3, 5, 2],
      [2, undefined, 5],
      [4, 5, 3],
      [1, 2, 5],
    ];

    // Every move targets two adjacent items (or a single end of the list).
    for (const [id, previous, next] of moves) {
      assert_ok(sut.move(id, previous, next));
      expected.splice(expected.indexOf(id), 1);
      const index = previous === undefined ? 0 : expected.indexOf(previous) + 1;
      expected.splice(index, 0, id);
      assert_links(sut, expected);
    }
  }

  @test("Should insert repeatedly at the same gap without breaking the order.", "move")
  lexical_list_move_same_gap() {
    const ids = Array.from({ length: 12 }, (_, i) => i + 1);
    const sut = this.#create(...ids);
    // Keeps moving the last item right after the first one, narrowing the gap each time.
    const expected = [...ids];
    for (let i = 0; i < 10; i++) {
      const last = sut.last()!.id;
      const second = expected[1]!;
      assert_ok(sut.move(last, expected[0], second));
      expected.splice(expected.indexOf(last), 1);
      expected.splice(1, 0, last);
      assert_links(sut, expected);
    }
  }

  @test("Should keep the selection pointing to the moved item.", "move")
  lexical_list_move_keeps_selection() {
    const sut = this.#create(1, 2, 3);
    sut.select(1);
    assert_ok(sut.move(1, 3, undefined));
    assert.equal(sut.selected()?.id, 1);
    assert.equal(sut.selected(), sut.last());
  }

  // ---------------------------------------------------------------------------
  // Set & Clear
  // ---------------------------------------------------------------------------

  @test("Should build the list from an array of items.", "set")
  lexical_list_set() {
    const sut = new LexicalList<number, Item>(this.#system);
    assert_ok(sut.set([
      { id: 1, position: "aaaa" },
      { id: 2, position: "bbbb" },
      { id: 3, position: "cccc" },
    ]));
    assert_links(sut, [1, 2, 3]);
    assert.equal(sut.find(2)?.position.toString(), "bbbb!");
  }

  @test("Should return no affected items and the list itself on trusted input.", "set")
  lexical_list_set_trusted_result() {
    const sut = new LexicalList<number, Item>(this.#system);
    const [affected, list] = assert_ok(
      sut.set([
        { id: 1, position: "aaaa" },
        { id: 2, position: "bbbb" },
      ]),
    );
    assert.deepEqual(affected, []);
    assert.equal(list, sut);
  }

  @test("Should reject positions out of order keeping the current content.", "set")
  lexical_list_set_trusted_not_ordered() {
    const sut = this.#create(1, 2);
    const values: Item[] = [
      { id: 7, position: "aaaa" },
      { id: 8, position: "cccc" },
      { id: 9, position: "bbbb" },
    ];
    assert_lexical_error(sut.set(values), "not-ordered");
    assert_links(sut, [1, 2]);
    assert.deepEqual(
      values.map((v) => v.position),
      ["aaaa", "cccc", "bbbb"],
      "The values must not be modified.",
    );
  }

  @test("Should reject equal positions when trusted.", "set")
  lexical_list_set_trusted_equal() {
    const sut = this.#create(1);
    assert_lexical_error(
      sut.set([
        { id: 7, position: "bbbb" },
        { id: 8, position: "bbbb!!" },
      ]),
      "not-ordered",
    );
    assert_links(sut, [1]);
  }

  @test("Should reject empty or invalid positions when trusted keeping the current content.", "set")
  lexical_list_set_trusted_invalid_position() {
    const sut = this.#create(1);
    const values: Item[] = [
      { id: 7, position: "aaaa" },
      { id: 8, position: "" },
    ];
    assert_lexical_error(sut.set(values), "position");
    assert_lexical_error(
      sut.set([
        { id: 7, position: "aaaa" },
        { id: 8, position: "bbbbzzzzzzzzzz" },
      ]),
      "position",
    );
    assert_links(sut, [1]);
    assert.equal(values[0]!.position, "aaaa", "The values must not be modified.");
  }

  @test("Should reject positions with characters of another system when trusted.", "set")
  lexical_list_set_trusted_foreign_characters() {
    const sut = this.#create(1);
    assert_lexical_error(
      sut.set([
        { id: 7, position: "aaaa" },
        { id: 8, position: "¼¼¼¼¿!" },
      ]),
      "position",
    );
    assert_links(sut, [1]);
  }

  @test("Should repair positions with characters of another system when untrusted.", "set")
  lexical_list_set_untrusted_foreign_characters() {
    const sut = new LexicalList<number, Item>(this.#system);
    const [affected] = assert_ok(
      sut.set(
        [
          { id: 1, position: "¼¼¼¼¼!" },
          { id: 2, position: "bbbb" },
          { id: 3, position: "aaAa" },
        ],
        { untrusted: true },
      ),
    );
    assert.deepEqual(
      affected.map((i) => i.id),
      [1, 3],
    );
    assert_links(sut, [2, 1, 3]);
  }

  @test("Should not affect any item on sorted untrusted input.", "set")
  lexical_list_set_untrusted_sorted() {
    const sut = new LexicalList<number, Item>(this.#system);
    const [affected] = assert_ok(
      sut.set(
        [
          { id: 1, position: "aaaa" },
          { id: 2, position: "bbbb" },
        ],
        { untrusted: true },
      ),
    );
    assert.deepEqual(affected, []);
    assert_links(sut, [1, 2]);
  }

  @test("Should sort untrusted input by position without changing any position.", "set")
  lexical_list_set_untrusted_out_of_order() {
    const sut = new LexicalList<number, Item>(this.#system);
    const [affected] = assert_ok(
      sut.set(
        [
          { id: 1, position: "cccc" },
          { id: 2, position: "aaaa" },
          { id: 3, position: "dddd" },
          { id: 4, position: "bbbb" },
        ],
        { untrusted: true },
      ),
    );
    assert.deepEqual(affected, []);
    assert_links(sut, [2, 4, 1, 3]);
  }

  @test("Should keep the first equal position and repair the others right after it.", "set")
  lexical_list_set_untrusted_equal() {
    const values: Item[] = [
      { id: 1, position: "aaaa" },
      { id: 2, position: "bbbb" },
      { id: 3, position: "bbbb" },
      { id: 4, position: "bbbb!!" },
      { id: 5, position: "cccc" },
    ];
    const sut = new LexicalList<number, Item>(this.#system);
    const [affected] = assert_ok(sut.set(values, { untrusted: true }));
    assert.deepEqual(
      affected.map((i) => i.id),
      [3, 4],
    );
    assert_links(sut, [1, 2, 3, 4, 5]);
    for (const item of affected) assert.equal(values.find((v) => v.id === item.id)!.position, item.position.toString());
  }

  @test("Should append empty and invalid positions at the end in the incoming order.", "set")
  lexical_list_set_untrusted_missing_positions() {
    const sut = new LexicalList<number, Item>(this.#system);
    const [affected] = assert_ok(
      sut.set(
        [
          { id: 1, position: "" },
          { id: 2, position: "bbbb" },
          { id: 3, position: "bbbbzzzzzzzzzz" },
          { id: 4, position: "aaaa" },
        ],
        { untrusted: true },
      ),
    );
    assert.deepEqual(
      affected.map((i) => i.id),
      [1, 3],
    );
    assert_links(sut, [4, 2, 1, 3]);
  }

  @test("Should give positions from the start when none is valid.", "set")
  lexical_list_set_untrusted_no_positions() {
    const sut = new LexicalList<number, Item>(this.#system);
    const [affected] = assert_ok(
      sut.set(
        [
          { id: 1, position: "" },
          { id: 2, position: "" },
          { id: 3, position: "" },
        ],
        { untrusted: true },
      ),
    );
    assert.deepEqual(
      affected.map((i) => i.id),
      [1, 2, 3],
    );
    assert_links(sut, [1, 2, 3]);
    assert.equal(sut.first()!.position.toString(), this.#position(0));
  }

  @test("Should repair many equal positions keeping them short.", "set")
  lexical_list_set_untrusted_many_equal() {
    const values: Item[] = [{ id: 0, position: "bbbb" }];
    for (let id = 1; id <= 30; id++) values.push({ id, position: "bbbb" });
    values.push({ id: 31, position: "bbbc" });
    const sut = new LexicalList<number, Item>(this.#system);
    const [affected] = assert_ok(sut.set(values, { untrusted: true }));
    assert.equal(affected.length, 30);
    assert_links(
      sut,
      values.map((v) => v.id),
    );
  }

  @test("Should space every position again when there is no room to repair.", "set")
  lexical_list_set_untrusted_respace() {
    const sut = new LexicalList<number, Item>(this.#system);
    const [affected] = assert_ok(
      sut.set(
        [
          { id: 1, position: "zzzz" },
          { id: 2, position: "zzzz" },
        ],
        { untrusted: true },
      ),
    );
    assert_links(sut, [1, 2]);
    assert.equal(sut.first()!.position.toString(), this.#position(0));
    assert.deepEqual(
      affected.map((i) => i.id),
      [1, 2],
    );
  }

  @test("Should still reject invalid or duplicated ids when untrusted.", "set")
  lexical_list_set_untrusted_invalid_ids() {
    const sut = this.#create(1);
    assert_lexical_error(sut.set([{ id: null as any, position: "aaaa" }], { untrusted: true }), "invalid-id");
    assert_lexical_error(
      sut.set(
        [
          { id: 7, position: "aaaa" },
          { id: 7, position: "bbbb" },
        ],
        { untrusted: true },
      ),
      "duplicate-id",
    );
    assert_links(sut, [1]);
  }

  @test("Should replace the previous content when setting a new array.", "set")
  lexical_list_set_replaces() {
    const sut = this.#create(1, 2, 3);
    assert_ok(sut.set([
      { id: 7, position: "aaaa" },
      { id: 8, position: "bbbb" },
    ]));
    assert_links(sut, [7, 8]);
    assert.equal(sut.find(1), undefined);
  }

  @test("Should empty the list when setting an empty array.", "set")
  lexical_list_set_empty() {
    const sut = this.#create(1, 2, 3);
    assert_ok(sut.set([]));
    assert_links(sut, []);
  }

  @test("Should reject an array with a null or undefined id keeping the current content.", "set")
  lexical_list_set_invalid_id() {
    const sut = this.#create(1, 2);
    const result = sut.set([
      { id: 7, position: "aaaa" },
      { id: undefined as any, position: "bbbb" },
    ]);
    assert_lexical_error(result, "invalid-id");
    assert_lexical_error(sut.set([{ id: null as any, position: "aaaa" }]), "invalid-id");
    assert_links(sut, [1, 2]);
  }

  @test("Should allow push, delete and move after setting an array.", "set")
  lexical_list_set_then_mutate() {
    const sut = new LexicalList<number, Item>(this.#system);
    assert_ok(sut.set([
      { id: 1, position: "aaaa" },
      { id: 2, position: "bbbb" },
    ]));
    assert_ok(sut.push({ id: 3, position: "" }));
    assert_links(sut, [1, 2, 3]);
    assert_ok(sut.move(3, undefined, 1));
    assert_links(sut, [3, 1, 2]);
    assert_ok(sut.delete(1));
    assert_links(sut, [3, 2]);
  }

  @test("Should clear every item from the list.", "set")
  lexical_list_clear() {
    const sut = this.#create(1, 2, 3);
    sut.clear();
    assert_links(sut, []);
    assert_ok(sut.push({ id: 4, position: "" }));
    assert_links(sut, [4]);
  }

  // ---------------------------------------------------------------------------
  // Sort
  // ---------------------------------------------------------------------------

  @test("Should sort an empty list without errors.", "sort")
  lexical_list_sort_empty() {
    const sut = new LexicalList<number, Item>(this.#system);
    const [affected, list] = assert_ok(sut.sort((a, b) => a.id - b.id));
    assert.deepEqual(affected, []);
    assert.deepEqual(list, []);
    assert_links(sut, []);
  }

  @test("Should not affect any item when the list is already sorted.", "sort")
  lexical_list_sort_already_sorted() {
    const sut = this.#create(1, 2, 3);
    const [affected, list] = assert_ok(sut.sort((a, b) => a.id - b.id));
    assert.deepEqual(affected, []);
    assert.deepEqual(
      list.map((i) => i.id),
      [1, 2, 3],
    );
    assert_links(sut, [1, 2, 3]);
  }

  @test("Should reverse the list, relinking items and reporting changed positions.", "sort")
  lexical_list_sort_reverse() {
    const sut = this.#create(1, 2, 3);
    const [affected, list] = assert_ok(sut.sort((a, b) => b.id - a.id));
    assert.deepEqual(
      list.map((i) => i.id),
      [3, 2, 1],
    );
    // The middle item keeps the same position so it must not be reported.
    assert.deepEqual(
      affected.map((i) => i.id),
      [3, 1],
    );
    assert_links(sut, [3, 2, 1]);
    assert.equal(sut.find(3)?.position.toString(), this.#position(0));
    assert.equal(sut.find(2)?.position.toString(), this.#position(1));
    assert.equal(sut.find(1)?.position.toString(), this.#position(2));
  }

  @test("Should normalize positions after moves when sorting by position.", "sort")
  lexical_list_sort_after_moves() {
    const sut = this.#create(1, 2, 3, 4);
    assert_ok(sut.move(4, 1, 2));
    assert_ok(sut.move(1, 3, undefined));
    assert_links(sut, [4, 2, 3, 1]);

    const comparator = (a: LexicalItem<number, Item>, b: LexicalItem<number, Item>) => {
      const order = a.position.compare(b.position);
      return order === "less" ? -1 : order === "greater" ? 1 : 0;
    };
    assert_ok(sut.sort(comparator));

    assert_links(sut, [4, 2, 3, 1]);
    [4, 2, 3, 1].forEach((id, index) => assert.equal(sut.find(id)?.position.toString(), this.#position(index)));
  }

  @test("Should not change the list nor the objects when the system has no room to sort.", "sort")
  lexical_list_sort_without_room() {
    // N has one digit from "a" to "c": sorting has room for "b!" and "c!" only
    const sut = new LexicalList<number, Item>(Staquia.create("!", "a", "c", 1, 3, 0));
    const objects = [
      { id: 1, position: "a!" },
      { id: 2, position: "b!" },
      { id: 3, position: "c!" },
    ];
    assert_ok(sut.set(objects));

    assert_lexical_error(
      sut.sort((a, b) => b.id - a.id),
      "position",
    );
    assert_links(sut, [1, 2, 3]);
    assert.deepEqual(
      objects.map((object) => object.position),
      ["a!", "b!", "c!"],
    );
  }

  @test("Should sort exactly as many items as the system has room for.", "sort")
  lexical_list_sort_up_to_the_room() {
    for (const [first, last, ln] of [["a", "c", 1], ["a", "c", 2], ["a", "d", 2], ["a", "b", 3]] as const) {
      const system = Staquia.create("!", first, last, ln, 3, 0);
      // The room: the positions stacked one by one from the start
      let room = 1;
      let position = assert_ok(system.start());
      for (let next = system.next(position); next.ok; next = system.next(position)) {
        position = next.value;
        room++;
      }
      const create = (count: number) => {
        const sut = new LexicalList<number, Item>(system);
        for (let id = 1; id <= count; id++) assert_ok(sut.push({ id, position: "" }));
        return sut;
      };
      const fits = create(room);
      assert_ok(fits.sort((a, b) => b.id - a.id));
      assert.equal(fits.first()?.id, room, `${room} items from ${first} to ${last} with ln ${ln}.`);

      // One more item fits with `push` (which also stacks before the start) but not in a sort
      const unshifted = create(room);
      assert_ok(unshifted.unshift({ id: room + 1, position: "" }));
      const before = assert_ok(unshifted.toArray()).map((item) => item.position.toString());
      assert_lexical_error(
        unshifted.sort((a, b) => b.id - a.id),
        "position",
      );
      assert.deepEqual(
        assert_ok(unshifted.toArray()).map((item) => item.position.toString()),
        before,
        `${room + 1} items from ${first} to ${last} with ln ${ln}.`,
      );
    }
  }

  // ---------------------------------------------------------------------------
  // Rebalance
  // ---------------------------------------------------------------------------

  @test("Should rebalance keeping the order and report only the changed positions.", "rebalance")
  lexical_list_rebalance() {
    const sut = this.#create(1, 2, 3);
    assert_ok(sut.move(3, 1, 2));
    assert_links(sut, [1, 3, 2]);

    const [affected, list] = assert_ok(sut.rebalance());
    assert.deepEqual(
      list.map((i) => i.id),
      [1, 3, 2],
    );
    // The first item keeps the start position so it must not be reported.
    assert.deepEqual(
      affected.map((i) => i.id),
      [3, 2],
    );
    assert_links(sut, [1, 3, 2]);
    [1, 3, 2].forEach((id, index) => assert.equal(sut.find(id)?.position.toString(), this.#position(index)));
  }

  @test("Should not change the list nor the objects when the system has no room to rebalance.", "rebalance")
  lexical_list_rebalance_without_room() {
    const sut = new LexicalList<number, Item>(Staquia.create("!", "a", "c", 1, 3, 0));
    const objects = [
      { id: 1, position: "a!" },
      { id: 2, position: "b!" },
      { id: 3, position: "c!" },
    ];
    assert_ok(sut.set(objects));

    assert_lexical_error(sut.rebalance(), "position");
    assert_links(sut, [1, 2, 3]);
    assert.deepEqual(
      objects.map((object) => object.position),
      ["a!", "b!", "c!"],
    );
  }

  // ---------------------------------------------------------------------------
  // Destroy
  // ---------------------------------------------------------------------------

  @test("Should release every reference when destroyed.", "destroy")
  lexical_list_destroy() {
    const sut = this.#create(1, 2);
    sut.select(1);
    sut.destroy();
    assert.equal(sut.first(), undefined);
    assert.equal(sut.last(), undefined);
    assert.equal(sut.selected(), undefined);
  }

  // ---------------------------------------------------------------------------
  // Falsy identifiers
  // ---------------------------------------------------------------------------

  @test("Should delete the item after an item with id 0.", "falsy ids")
  lexical_list_delete_after_zero_id() {
    const sut = this.#create(0, 1, 2);
    assert_ok(sut.delete(1));
    assert_links(sut, [0, 2]);
  }

  @test("Should delete the item before an item with id 0.", "falsy ids")
  lexical_list_delete_before_zero_id() {
    const sut = this.#create(1, 2, 0);
    assert_ok(sut.delete(2));
    assert_links(sut, [1, 0]);
  }

  @test("Should move an item next to an item with id 0.", "falsy ids")
  lexical_list_move_around_zero_id() {
    const sut = this.#create(0, 1, 2);
    assert_ok(sut.move(2, 0, 1));
    assert_links(sut, [0, 2, 1]);
    assert_ok(sut.move(0, 1, undefined));
    assert_links(sut, [2, 1, 0]);
  }

  @test("Should work with string ids, including the empty string.", "falsy ids")
  lexical_list_string_ids() {
    const sut = new LexicalList<string, { id: string; position: string }>(this.#system);
    for (const id of ["", "a", "b", "c"]) assert_ok(sut.push({ id, position: "" }));
    assert_ok(sut.delete("a"));
    assert_ok(sut.move("", "b", "c"));
    assert_ok(sut.unshift({ id: "d", position: "" }));
    const ids = assert_ok(sut.toArray()).map((i) => i.id);
    assert.deepEqual(ids, ["d", "b", "", "c"]);
    assert.equal(sut.first()?.id, "d");
    assert.equal(sut.last()?.id, "c");
    assert.equal(sut.find("")?.previous, "b");
    assert.equal(sut.find("")?.next, "c");
  }

  // ---------------------------------------------------------------------------
  // Persistence
  // ---------------------------------------------------------------------------

  @test("Should write the new position back into the wrapped object on move.", "persistence")
  lexical_list_move_writes_back() {
    const values: Item[] = [1, 2, 3].map((id) => ({ id, position: "" }));
    const sut = new LexicalList<number, Item>(this.#system);
    for (const value of values) assert_ok(sut.push(value));
    const item = assert_ok(sut.move(3, 1, 2));
    assert.equal(values[2]!.position, item.position.toString());
  }

  @test("Should write the new positions back into the wrapped objects on sort.", "persistence")
  lexical_list_sort_writes_back() {
    const values: Item[] = [1, 2, 3].map((id) => ({ id, position: "" }));
    const sut = new LexicalList<number, Item>(this.#system);
    for (const value of values) assert_ok(sut.push(value));
    assert_ok(sut.sort((a, b) => b.id - a.id));
    for (const value of values) assert.equal(value.position, sut.find(value.id)!.position.toString());
  }

  @test("Should only change the position of the moved item.", "persistence")
  lexical_list_move_changes_single_position() {
    const values: Item[] = [1, 2, 3, 4, 5].map((id) => ({ id, position: "" }));
    const sut = new LexicalList<number, Item>(this.#system);
    for (const value of values) assert_ok(sut.push(value));

    const moves: [number, number | undefined, number | undefined][] = [
      [5, 1, 2], // 1 5 2 3 4
      [1, 4, undefined], // 5 2 3 4 1
      [3, 4, 1], // 5 2 4 3 1
      [2, undefined, 5], // 2 5 4 3 1
    ];
    for (const [id, previous, next] of moves) {
      const before = values.map((v) => v.position);
      assert_ok(sut.move(id, previous, next));
      values.forEach((value, index) => {
        if (value.id === id) assert.notEqual(value.position, before[index], `The moved item (id: ${id}) must change its position.`);
        else assert.equal(value.position, before[index], `The item (id: ${value.id}) must keep its position when moving the item (id: ${id}).`);
      });
    }
  }

  @test("Should rebuild the same list from the stored positions sorted as strings.", "persistence")
  lexical_list_rebuild_from_stored_positions() {
    // Arrange: mutate the list as an application would do.
    const sut = this.#create(1, 2, 3, 4, 5, 6);
    assert_ok(sut.move(6, 1, 2)); // 1 6 2 3 4 5
    assert_ok(sut.move(2, undefined, 1)); // 2 1 6 3 4 5
    assert_ok(sut.unshift({ id: 7, position: "" })); // 7 2 1 6 3 4 5
    assert_ok(sut.delete(4)); // 7 2 1 6 3 5
    assert_ok(sut.move(7, 3, 5)); // 2 1 6 3 7 5
    assert_ok(sut.move(1, 6, 3)); // 2 6 1 3 7 5
    const expected = [2, 6, 1, 3, 7, 5];
    assert_links(sut, expected);

    // Act: simulate the stored records, loaded sorted by the position column.
    const records = assert_ok(sut.toArray())
      .map((i) => ({ id: i.id, position: i.position.toString() }))
      .sort((a, b) => (a.position < b.position ? -1 : a.position > b.position ? 1 : 0));
    const reloaded = new LexicalList<number, Item>(this.#system);
    assert_ok(reloaded.set(records));

    // Assert
    assert_links(reloaded, expected);
  }

  // ---------------------------------------------------------------------------
  // Threshold
  // ---------------------------------------------------------------------------

  @test("Should fail without changes when a gap is exhausted and recover after sorting.", "threshold")
  lexical_list_threshold_and_rebalance() {
    const sut = this.#create(1, 2, 3);
    const order = [1, 2, 3];

    // Keep moving the last item right after the first one until the gap is exhausted.
    let failure: LexicalError | undefined;
    for (let i = 0; i < 500 && !failure; i++) {
      const last = sut.last()!.id;
      const second = sut.find(sut.first()!.next!)!.id;
      const before = assert_ok(sut.toArray()).map((item) => item.position.toString());
      const result = sut.move(last, sut.first()!.id, second);
      if (!result.ok) {
        failure = result.error;
        assert_links(sut, order);
        assert.deepEqual(
          assert_ok(sut.toArray()).map((item) => item.position.toString()),
          before,
          "A failed move must not change any position.",
        );
      } else {
        order.splice(order.indexOf(last), 1);
        order.splice(1, 0, last);
        assert_links(sut, order);
      }
    }
    assert.ok(failure, "The gap was never exhausted.");
    assert.equal(failure.type, "position");

    // Sorting by the current position re-spaces every item keeping the order.
    assert_ok(sut.sort((a, b) => (a.position.toString() < b.position.toString() ? -1 : 1)));
    assert_links(sut, order);
    const last = sut.last()!.id;
    assert_ok(sut.move(last, sut.first()!.id, sut.find(sut.first()!.next!)!.id));
  }

  @test("Should fail without changes when pushing past the end of N and recover after sorting.", "threshold")
  lexical_list_push_past_n_end() {
    const sut = new LexicalList<number, Item>(this.#system);
    assert_ok(sut.set([{ id: 1, position: "zzzy" }]));
    assert_ok(sut.push({ id: 2, position: "" }));
    assert.equal(sut.last()!.position.toString(), "zzzz!");

    assert_lexical_error(sut.push({ id: 3, position: "" }), "position");
    assert_links(sut, [1, 2]);

    assert_ok(sut.sort((a, b) => (a.position.toString() < b.position.toString() ? -1 : 1)));
    assert_ok(sut.push({ id: 3, position: "" }));
    assert_links(sut, [1, 2, 3]);
  }

  @test("Should fail without changes when unshifting past the start of N and recover after sorting.", "threshold")
  lexical_list_unshift_past_n_start() {
    const sut = new LexicalList<number, Item>(this.#system);
    assert_ok(sut.set([{ id: 1, position: "!!!a" }]));
    assert_ok(sut.unshift({ id: 2, position: "" }));
    assert.equal(sut.first()!.position.toString(), "!!!!!");

    assert_lexical_error(sut.unshift({ id: 3, position: "" }), "position");
    assert_links(sut, [2, 1]);

    assert_ok(sut.sort((a, b) => (a.position.toString() < b.position.toString() ? -1 : 1)));
    assert_ok(sut.unshift({ id: 3, position: "" }));
    assert_links(sut, [3, 2, 1]);
  }

  // ---------------------------------------------------------------------------
  // Randomized
  // ---------------------------------------------------------------------------

  @test("Should keep the list consistent against a reference array on random operations.", "randomized")
  lexical_list_randomized() {
    // Deterministic pseudo random generator (mulberry32) so failures are reproducible.
    let seed = 0x5eed;
    const random = () => {
      seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    const pick = <V>(array: V[]) => array[Math.floor(random() * array.length)]!;

    const sut = new LexicalList<number, Item>(this.#system);
    const reference: number[] = [];
    let nextId = 0;

    for (let step = 0; step < 400; step++) {
      const roll = random();
      let operation: string;

      if (reference.length < 2 || roll < 0.25) {
        operation = "push";
        const id = nextId++;
        assert_ok(sut.push({ id, position: "" }));
        reference.push(id);
      } else if (roll < 0.45) {
        operation = "unshift";
        const id = nextId++;
        assert_ok(sut.unshift({ id, position: "" }));
        reference.unshift(id);
      } else if (roll < 0.6) {
        operation = "delete";
        const id = pick(reference);
        assert_ok(sut.delete(id));
        reference.splice(reference.indexOf(id), 1);
      } else {
        operation = "move";
        const id = pick(reference);
        const others = reference.filter((other) => other !== id);
        // Index of the gap in `others` where the item is moved (0 = top, length = bottom).
        const gap = Math.floor(random() * (others.length + 1));
        const previous = others[gap - 1];
        const next = others[gap];
        const result = sut.move(id, previous, next);
        if (!result.ok) {
          // An exhausted gap is valid, the list must stay untouched and recover after sorting.
          assert.equal(result.error.type, "position", `Step ${step}: unexpected '${result.error.message}'.`);
          assert_links(sut, reference);
          assert_ok(sut.sort((a, b) => (a.position.toString() < b.position.toString() ? -1 : 1)));
        } else {
          reference.splice(0, reference.length, ...others.slice(0, gap), id, ...others.slice(gap));
        }
      }

      try {
        assert_links(sut, reference);
      } catch (error) {
        throw Error(`Step ${step} (${operation}): ${(error as Error).message}`);
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Integrity
  // ---------------------------------------------------------------------------

  @test("Should reject pushing an id that already exists.", "integrity")
  lexical_list_push_duplicate_id() {
    const sut = this.#create(1, 2);
    assert_lexical_error(sut.push({ id: 1, position: "" }), "duplicate-id");
    assert_links(sut, [1, 2]);
  }

  @test("Should reject unshifting an id that already exists.", "integrity")
  lexical_list_unshift_duplicate_id() {
    const sut = this.#create(1, 2);
    assert_lexical_error(sut.unshift({ id: 2, position: "" }), "duplicate-id");
    assert_links(sut, [1, 2]);
  }

  @test("Should reject setting an array with duplicated ids keeping the current content.", "integrity")
  lexical_list_set_duplicate_id() {
    const sut = this.#create(1, 2);
    const result = sut.set([
      { id: 7, position: "aaaa" },
      { id: 7, position: "bbbb" },
    ]);
    assert_lexical_error(result, "duplicate-id");
    assert_links(sut, [1, 2]);
  }

  @test("Should accept an id again once its item was deleted.", "integrity")
  lexical_list_reuse_deleted_id() {
    const sut = this.#create(1, 2);
    assert_ok(sut.delete(1));
    assert_ok(sut.push({ id: 1, position: "" }));
    assert_links(sut, [2, 1]);
  }

  @test("Should clear the selection when the selected item is deleted.", "integrity")
  lexical_list_delete_clears_selection() {
    const sut = this.#create(1, 2);
    sut.select(2);
    assert_ok(sut.delete(2));
    assert.equal(sut.selected(), undefined);
  }

  @test("Should keep the selection when another item is deleted.", "integrity")
  lexical_list_delete_keeps_other_selection() {
    const sut = this.#create(1, 2);
    sut.select(2);
    assert_ok(sut.delete(1));
    assert.equal(sut.selected()?.id, 2);
  }

  @test("Should clear the selection when the list is cleared or replaced.", "integrity")
  lexical_list_clear_and_set_clear_selection() {
    const sut = this.#create(1, 2);
    sut.select(1);
    sut.clear();
    assert.equal(sut.selected(), undefined, "clear() must remove the selection.");
    assert_ok(sut.push({ id: 1, position: "" }));
    sut.select(1);
    assert_ok(sut.set([{ id: 1, position: "aaaa" }]));
    assert.equal(sut.selected(), undefined, "set() must remove the selection.");
  }
}
