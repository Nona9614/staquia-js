// Entities
import Staquia from "../entities/staquia.js";
// Errors
import LexicalError from "../errors/lexical-error.js";
// Results
import { Err, Ok, Result } from "../result.js";
// Types
import type { IPositionResult } from "../results/position-result.js";
// Interfaces
import IPosition from "../interfaces/position.js";
import LexicalItem, { Item } from "./lexical-item.js";

/** An incoming value of `set` with its forged position (if valid) and its final position. */
interface SetEntry<K, T extends Item<K>> {
  value: T;
  original: IPosition | undefined;
  position: IPosition | undefined;
}

/** Converts the ordering of two positions to a number for `Array.prototype.sort`. */
const ordering = (a: IPosition, b: IPosition) => {
  const order = a.compare(b);
  return order === "less" ? -1 : order === "greater" ? 1 : 0;
};

/**
 * A list that keeps the order of your objects and their positions in sync, as a doubly linked list.
 *
 * Any object with an `id` (never `null` or `undefined`) and a `position` string can be stored. Every operation
 * updates the `position` field of your objects and tells you which items changed: in the usual case only one,
 * so only one row needs to be saved. Nothing is thrown: the operations return a `Result`, and when one fails
 * neither the list nor your objects are changed.
 *
 * @template K The type of the `id` of the items.
 * @template T The type of the stored objects.
 *
 * @example
 * import Staquia, { LexicalList } from "staquia";
 *
 * interface Task {
 *   id: number;
 *   title: string;
 *   position: string;
 * }
 *
 * const list = new LexicalList<number, Task>(Staquia.create("!", "a", "z", 5, 15, 0.15));
 *
 * const write: Task = { id: 1, title: "Write", position: "" };
 * const review: Task = { id: 2, title: "Review", position: "" };
 * const publish: Task = { id: 3, title: "Publish", position: "" };
 * list.push(write); // "mmmmm!"
 * list.push(review); // "mmmmn!"
 * list.push(publish); // "mmmmo!"
 *
 * // Moves "Publish" between "Write" and "Review": only its position changes
 * const moved = list.move(3, 1, 2);
 * if (moved.ok) console.log(publish.position); // "mmmmmn", save only this task
 */
export default class LexicalList<K, T extends Item<K>> {
  #system: Staquia;
  #list: Map<K, LexicalItem<K, T>> = new Map();
  #selected: LexicalItem<K, T> | undefined = undefined;
  #first: LexicalItem<K, T> | undefined = undefined;
  #last: LexicalItem<K, T> | undefined = undefined;

  /** @param system The number system that creates the positions of the items. */
  constructor(system: Staquia) {
    this.#system = system;
  }

  /** The number of items in the list. */
  get size() {
    return this.#list.size;
  }

  /**
   * Verifies that the value can be added to the list: its id can't be `null`, `undefined`
   * or an id that is already stored.
   *
   * @returns The error if the value is not valid, otherwise `undefined`.
   */
  #validate(value: T): Err<LexicalError> | undefined {
    if (value.id === undefined || value.id === null) return new Err(LexicalError.invalidId(value.id));
    if (this.#list.has(value.id)) return new Err(LexicalError.duplicateId(value.id));
    return undefined;
  }
  /**
   * Detaches the item from its neighbors, patching their pointers or the list boundaries.
   *
   * Neighbors are resolved with a direct lookup: ids are never `null` or `undefined` inside the map
   * (enforced by `push` and `set`), so a missing neighbor lookup means the item is at that end.
   */
  #unlink(item: LexicalItem<K, T>) {
    const previous = this.#list.get(item.previous!);
    const next = this.#list.get(item.next!);

    if (previous) previous.next = item.next;
    else this.#first = next;

    if (next) next.previous = item.previous;
    else this.#last = previous;
  }

  /**
   * Gets the selected item, see `select`. The selection is cleared when the item is deleted,
   * or when the list is cleared or replaced.
   */
  selected(): LexicalItem<K, T> | undefined {
    return this.#selected;
  }
  /**
   * Selects the item with the id, for example the one being dragged or edited.
   * An id that is not in the list clears the selection.
   *
   * @param id The id of the item to select.
   */
  select(id: K | undefined | null) {
    this.#selected = this.#list.get(id!);
  }
  /** Gets the first item of the list, or `undefined` if it is empty. */
  first() {
    return this.#first;
  }
  /** Gets the last item of the list, or `undefined` if it is empty. */
  last() {
    return this.#last;
  }
  /**
   * Gets an item by its id. The item exposes its `id`, its `position` and the ids of its `previous` and `next` items.
   *
   * @param id The id of the item.
   * @returns The item, or `undefined` if there is no item with that id.
   */
  find(id: K | undefined | null): LexicalItem<K, T> | undefined {
    return this.#list.get(id!);
  }
  /**
   * Adds an object at the end of the list, with the position after the last item (or the start position
   * if the list is empty). Its `position` field is set, so the object itself can be saved.
   *
   * @param value The object to add.
   *
   * @example
   * import Staquia, { LexicalList } from "staquia";
   *
   * const list = new LexicalList(Staquia.create("!", "a", "z", 5, 15, 0.15));
   *
   * const milk = { id: 1, text: "Milk", position: "" };
   * const added = list.push(milk);
   * if (added.ok) console.log(milk.position); // "mmmmm!"
   *
   * // Ids must be unique, and never null or undefined
   * const duplicated = list.push({ id: 1, text: "Milk again", position: "" });
   * if (!duplicated.ok) console.log(duplicated.error.type); // "duplicate-id"
   *
   * @returns The added item (the only one to save), or the error: `"invalid-id"`, `"duplicate-id"`,
   * or `"position"` if there is no room left after the last item.
   */
  push(value: T): Result<LexicalItem<K, T>, LexicalError> {
    const invalid = this.#validate(value);
    if (invalid) return invalid;

    const position = this.tail();
    if (!position.ok) return position;

    const item = new LexicalItem<K, T>(value, position.value);

    this.#list.set(item.id, item);

    // The first item to be added to the list
    if (!this.#first || !this.#last) {
      this.#first = item;
      this.#last = item;
    }
    // The item will be added to the top of the list
    else {
      item.previous = this.#last.id;
      this.#last.next = item.id;
      this.#last = item;
    }

    item.position = position.value;
    return new Ok(item);
  }
  /**
   * Adds an object at the start of the list, with the position before the first item (or the start position
   * if the list is empty). Its `position` field is set, so the object itself can be saved.
   *
   * @param value The object to add.
   *
   * @example
   * import Staquia, { LexicalList } from "staquia";
   *
   * const list = new LexicalList(Staquia.create("!", "a", "z", 5, 15, 0.15));
   * list.push({ id: 1, text: "Milk", position: "" }); // "mmmmm!"
   *
   * const bread = { id: 2, text: "Bread", position: "" };
   * const added = list.unshift(bread);
   * if (added.ok) console.log(bread.position); // "mmmml!", before "Milk"
   *
   * @returns The added item (the only one to save), or the error: `"invalid-id"`, `"duplicate-id"`,
   * or `"position"` if there is no room left before the first item.
   */
  unshift(value: T): Result<LexicalItem<K, T>, LexicalError> {
    const invalid = this.#validate(value);
    if (invalid) return invalid;

    const position = this.head();
    if (!position.ok) return position;

    const item = new LexicalItem<K, T>(value, position.value);

    this.#list.set(item.id, item);

    // The first item to be added to the list
    if (!this.#first || !this.#last) {
      this.#first = item;
      this.#last = item;
    }
    // The item will be added to the start of the list
    else {
      item.next = this.#first.id;
      this.#first.previous = item.id;
      this.#first = item;
    }

    return new Ok(item);
  }
  /**
   * Removes an item. The other positions don't change, so nothing else needs to be saved.
   *
   * @param id The id of the item to remove.
   * @returns An empty success, or a `"not-found"` error.
   */
  delete(id: K | undefined | null): Result<void, LexicalError> {
    const item = this.#list.get(id!);
    if (!item) return new Err(LexicalError.notFound(id));

    this.#unlink(item);
    this.#list.delete(id!);
    if (this.#selected === item) this.#selected = undefined;
    return new Ok();
  }
  /**
   * Moves an item between two neighbors, for example when a drag and drop ends. **Only the moved item gets a new
   * position**: the one between its new neighbors (or the one before the first item, or after the last one).
   *
   * The neighbors are verified in constant time: the move fails with a `"not-adjacent"` error when `previousId` is
   * not immediately followed by `nextId` (ignoring the moved item itself), when only `previousId` is passed but it
   * is not the last item, or when only `nextId` is passed but it is not the first item. Moving an item to the place
   * it already occupies does nothing and keeps its position. `null` and `undefined` mean "no neighbor".
   *
   * When there is no room left between the neighbors (the threshold or the overflow), it fails with a `"position"`
   * error: space the positions again with `sort` and repeat the move.
   *
   * @param id The id of the item to move.
   * @param previousId The id of its new previous item, or `undefined` to move it to the start.
   * @param nextId The id of its new next item, or `undefined` to move it to the end.
   *
   * @example
   * import Staquia, { LexicalList } from "staquia";
   *
   * const list = new LexicalList(Staquia.create("!", "a", "z", 5, 15, 0.15));
   * const milk = { id: 1, position: "" };
   * const meat = { id: 2, position: "" };
   * const bread = { id: 3, position: "" };
   * list.push(milk); // "mmmmm!"
   * list.push(meat); // "mmmmn!"
   * list.push(bread); // "mmmmo!"
   *
   * // Moves the bread between the milk and the meat
   * const moved = list.move(3, 1, 2);
   * if (moved.ok) console.log(bread.position); // "mmmmmn", the only position that changed
   *
   * // Moves the meat to the start
   * list.move(2, undefined, 1);
   *
   * // The neighbors must be next to each other: the order is 2, 1, 3 and "3" is the last item
   * const wrong = list.move(1, 3, 2);
   * if (!wrong.ok) console.log(wrong.error.type); // "not-adjacent"
   *
   * @returns The moved item (the only one to save), or the error: `"not-found"`, `"not-adjacent"` or `"position"`.
   */
  move(
    id: K | undefined | null,
    previousId?: K | undefined | null,
    nextId?: K | undefined | null,
  ): Result<LexicalItem<K, T>, LexicalError> {
    const item = this.#list.get(id!);
    if (!item) return new Err(LexicalError.notFound(id));

    // Obtaining the previous and next item, `null` and `undefined` are never stored as keys
    // so a direct lookup with them simply returns `undefined` (no neighbor on that side)
    const previous = this.#list.get(previousId!);
    const next = this.#list.get(nextId!);
    // An id that was passed but is not in the list is most likely stale, so it must not be ignored
    if (!previous && previousId != null) return new Err(LexicalError.notFound(previousId));
    if (!next && nextId != null) return new Err(LexicalError.notFound(nextId));
    if (!previous && !next) {
      return new Err(new LexicalError(`At least the previous or next item must be provided to move the item (id: ${id}).`, "position"));
    }

    // An item can't be its own neighbor
    if (previous === item || next === item) {
      return new Err(LexicalError.notAdjacent(`The item (id: ${id}) can't be moved next to itself.`));
    }

    // Verify adjacency in O(1) as if the item was already unlinked from its current place:
    // - With both neighbors, `previous` must be followed by `next`.
    // - With only `previous`, it must be the last item (moving to the bottom).
    // - With only `next`, it must be the first item (moving to the top).
    if (previous) {
      const following = previous.next === item.id ? item.next : previous.next;
      if (following !== next?.id) {
        return new Err(
          LexicalError.notAdjacent(
            next
              ? `The previous item (id: ${previousId}) and next item (id: ${nextId}) are not adjacent.`
              : `The previous item (id: ${previousId}) is not the last item, a next item must be provided.`,
          ),
        );
      }
    } else if (next) {
      const preceding = next.previous === item.id ? item.previous : next.previous;
      if (preceding !== undefined) {
        return new Err(LexicalError.notAdjacent(`The next item (id: ${nextId}) is not the first item, a previous item must be provided.`));
      }
    }

    // The item is already in the requested place, nothing to do
    if (item.previous === previous?.id && item.next === next?.id) return new Ok(item);

    // Update position
    let position: IPositionResult;
    if (previous && next) {
      position = this.#system.core(previous.position, next.position);
    } else if (previous) {
      position = this.#system.next(previous.position);
    } else {
      position = this.#system.previous(next!.position);
    }
    if (!position.ok) return new Err(LexicalError.from(position.error));
    item.position = position.value;

    // Unlink item from its current position
    this.#unlink(item);

    // Wire item into its new position
    item.previous = previous?.id;
    item.next = next?.id;

    if (previous) {
      previous.next = item.id;
    } else {
      this.#first = item;
    }

    if (next) {
      next.previous = item.id;
    } else {
      this.#last = item;
    }

    return new Ok(item);
  }
  /**
   * Gets the position an item would take at the start of the list: the one before the first item,
   * or the start position if the list is empty.
   *
   * @returns The position, or a `"position"` error if there is no room before the first item.
   */
  head(): Result<IPosition, LexicalError> {
    // Creates the position based on the first stored item
    const item = this.#first ? this.#system.previous(this.#first.position) : this.#system.start();
    if (!item.ok) return new Err(LexicalError.from(item.error));
    return new Ok(item.value);
  }
  /**
   * Gets the position an item would take at the end of the list: the one after the last item,
   * or the start position if the list is empty.
   *
   * @returns The position, or a `"position"` error if there is no room after the last item.
   */
  tail(): Result<IPosition, LexicalError> {
    // Creates the position based on the last stored item
    const item = this.#last ? this.#system.next(this.#last.position) : this.#system.start();
    if (!item.ok) return new Err(LexicalError.from(item.error));
    return new Ok(item.value);
  }
  /**
   * Replaces the content of the list with the passed values.
   *
   * By default the values are **trusted**: they are expected to be already sorted by their
   * position (e.g. loaded with an `ORDER BY position` query), so they are linked in the same
   * order and no position is changed. The order is still verified (one comparison per item),
   * failing with a `"not-ordered"` error if a position is not strictly greater than the previous one,
   * and with a `"position"` error if a position is empty or can't be forged.
   *
   * With `untrusted` the values are sorted by their position and repaired instead of rejected:
   * - Equal positions keep the first one and give new positions to the others, right after it.
   * - Empty or invalid positions are given new positions at the end of the list (in the incoming order).
   * - If there is no room to repair them, every position is spaced again from the start.
   *
   * Nothing is changed (neither the list nor the passed values) when an error is returned.
   * In both modes `null`, `undefined` or repeated ids fail with an `"invalid-id"` or `"duplicate-id"` error.
   *
   * @param list The values to be stored in the list.
   * @param options.untrusted If set, sorts and repairs the positions instead of failing.
   *
   * @example
   * import Staquia, { LexicalList } from "staquia";
   *
   * const list = new LexicalList(Staquia.create("!", "a", "z", 5, 15, 0.15));
   *
   * // Trusted (default): the rows come sorted from the database, e.g. ORDER BY position
   * const loaded = list.set([
   *   { id: 1, position: "mmmmm!" },
   *   { id: 2, position: "mmmmn!" },
   * ]);
   * if (loaded.ok) console.log(loaded.value[0].length); // 0, nothing to save
   *
   * // Untrusted: sorted, and repeated or empty positions repaired
   * const repaired = list.set(
   *   [
   *     { id: 1, position: "ccccc" },
   *     { id: 2, position: "aaaaa" },
   *     { id: 3, position: "aaaaa" }, // repeated
   *     { id: 4, position: "" }, // missing
   *   ],
   *   { untrusted: true },
   * );
   * if (repaired.ok) {
   *   const [affected] = repaired.value;
   *   // Order: 2, 3, 1, 4. Save only the repaired rows:
   *   console.log(affected.map((item) => `${item.id}: ${item.position}`)); // ["3: bbbbb!", "4: ccccd!"]
   * }
   *
   * @returns The items whose position changed (only these need to be saved) and this list.
   */
  set(
    list: T[],
    options?: { untrusted?: boolean },
  ): Result<[affected: LexicalItem<K, T>[], list: LexicalList<K, T>], LexicalError> {
    const untrusted = options?.untrusted ?? false;

    // Validate the ids before touching the current content
    const ids = new Set<K>();
    for (const value of list) {
      if (value.id === undefined || value.id === null) return new Err(LexicalError.invalidId(value.id));
      if (ids.has(value.id)) return new Err(LexicalError.duplicateId(value.id));
      ids.add(value.id);
    }

    // Forge the positions without creating the items yet, as creating them writes the
    // position back into the values and nothing must change if this method fails
    const entries: SetEntry<K, T>[] = new Array(list.length);
    for (let i = 0; i < list.length; i++) {
      const value = list[i]!;
      const forged = value.position ? this.#system.forge(value.position) : undefined;
      const original = forged?.ok ? forged.value : undefined;
      if (!original && !untrusted) {
        const reason = forged && !forged.ok ? forged.error.message : "The position is empty.";
        return new Err(LexicalError.invalidPosition(value.id, value.position, reason));
      }
      entries[i] = { value, original, position: original };
    }

    let ordered: SetEntry<K, T>[];
    if (!untrusted) {
      // Trusted: only verify that the incoming order is valid
      for (let i = 1; i < entries.length; i++) {
        const previous = entries[i - 1]!;
        const current = entries[i]!;
        if (previous.position!.compare(current.position!) !== "less") {
          return new Err(
            LexicalError.notOrdered(i, previous.value.id, previous.position!.toString(), current.value.id, current.position!.toString()),
          );
        }
      }
      ordered = entries;
    } else {
      // Untrusted: sort by position (stable) and leave the entries without position at the end
      const positioned = entries.filter((e) => e.position).sort((a, b) => ordering(a.position!, b.position!));
      const unpositioned = entries.filter((e) => !e.position);
      // Equal positions keep the first one, the others will be given a new position after it
      for (let i = 1, kept = positioned[0]; i < positioned.length; i++) {
        const current = positioned[i]!;
        if (current.position!.compare(kept!.position!) === "equal") current.position = undefined;
        else kept = current;
      }
      ordered = positioned.concat(unpositioned);
      // Fill the missing positions, if there is no room space every position again
      if (!this.#fill(ordered)) {
        const respaced = this.#respace(ordered);
        if (respaced) return respaced;
      }
    }

    // Everything is valid, replace the content
    this.#list.clear();
    this.#first = undefined;
    this.#last = undefined;
    this.#selected = undefined;

    const affected: LexicalItem<K, T>[] = [];
    let previous: LexicalItem<K, T> | undefined;
    for (const entry of ordered) {
      const item = new LexicalItem<K, T>(entry.value, entry.position!);
      if (!entry.original || entry.original.compare(entry.position!) !== "equal") affected.push(item);

      item.previous = previous?.id;
      if (previous) previous.next = item.id;
      else this.#first = item;

      this.#list.set(item.id, item);
      previous = item;
    }
    this.#last = previous;

    return new Ok([affected, this]);
  }
  /**
   * Gives a position to every entry without one, using its closest positioned neighbors:
   * - Between two positions, the run is filled splitting the gap in halves to keep the positions short.
   * - After the last position, the run is filled going `next`.
   * - Before the first position, the run is filled going `previous`.
   * - Without any position, the run is filled from the start going `next`.
   *
   * @returns `false` if there is no room for some position.
   */
  #fill(entries: SetEntry<K, T>[]): boolean {
    const system = this.#system;

    const bisect = (from: number, to: number, left: IPosition, right: IPosition): boolean => {
      if (from >= to) return true;
      const middle = (from + to) >> 1;
      const core = system.core(left, right);
      if (!core.ok) return false;
      entries[middle]!.position = core.value;
      return bisect(from, middle, left, core.value) && bisect(middle + 1, to, core.value, right);
    };

    let i = 0;
    while (i < entries.length) {
      if (entries[i]!.position) {
        i++;
        continue;
      }
      // The run of entries without position is [i, j)
      let j = i;
      while (j < entries.length && !entries[j]!.position) j++;
      const left = entries[i - 1]?.position;
      const right = entries[j]?.position;

      if (left && right) {
        if (!bisect(i, j, left, right)) return false;
      } else if (right) {
        let reference = right;
        for (let k = j - 1; k >= i; k--) {
          const previous = system.previous(reference);
          if (!previous.ok) return false;
          entries[k]!.position = reference = previous.value;
        }
      } else {
        let reference: IPositionResult = left ? system.next(left) : system.start();
        for (let k = i; k < j; k++) {
          if (!reference.ok) return false;
          entries[k]!.position = reference.value;
          if (k + 1 < j) reference = system.next(reference.value);
        }
      }
      i = j;
    }
    return true;
  }
  /**
   * Spaces again every entry position from the start, keeping their order.
   *
   * @returns The error if the system has no room for all the entries.
   */
  #respace(entries: SetEntry<K, T>[]): Err<LexicalError> | undefined {
    let reference: IPositionResult = this.#system.start();
    for (let i = 0; i < entries.length; i++) {
      if (!reference.ok) return new Err(LexicalError.from(reference.error));
      entries[i]!.position = reference.value;
      if (i + 1 < entries.length) reference = this.#system.next(reference.value);
    }
    return undefined;
  }
  /** Removes every item and the selection. Your objects are not changed. */
  clear() {
    this.#first = undefined;
    this.#last = undefined;
    this.#selected = undefined;
    this.#list.clear();
  }
  /**
   * Sorts the items with a compare function and spaces every position again from the start position,
   * going `next` one by one.
   *
   * Use it to sort by any criteria, or to rebalance the positions keeping the current order after a
   * `"position"` error (the threshold or the overflow was reached).
   *
   * @param compareFn Compares two items, like `Array.prototype.sort`: negative if `a` goes first.
   *
   * @example
   * import Staquia, { LexicalList } from "staquia";
   *
   * const list = new LexicalList(Staquia.create("!", "a", "z", 5, 15, 0.15));
   * list.set([{ id: 1, position: "aaaaa" }, { id: 2, position: "bbbbb" }]);
   *
   * // Rebalances keeping the current order
   * const sorted = list.sort((a, b) => (a.position.less(b.position) ? -1 : 1));
   * if (sorted.ok) {
   *   const [affected] = sorted.value;
   *   console.log(affected.map((item) => item.position.toString())); // ["mmmmm!", "mmmmn!"], save these
   * }
   *
   * @returns The items whose position changed (only these need to be saved) and every item in the new order,
   * or a `"position"` error if the system has no room for all of them.
   */
  sort(
    compareFn: (a: LexicalItem<K, T>, b: LexicalItem<K, T>) => number,
  ): Result<[LexicalItem<K, T>[], LexicalItem<K, T>[]], LexicalError> {
    const affected: LexicalItem<K, T>[] = [];

    const _list = this.toArray();
    if (!_list.ok) return _list;
    const list = _list.value;

    if (list.length === 0) return new Ok([affected, list]);
    list.sort(compareFn);

    // Reset pointers and assign the initial position
    const _start = this.#system.start();
    if (!_start.ok) return new Err(LexicalError.from(_start.error));
    let currentPosition = _start.value;

    const first = list[0]!;
    if (first) {
      if (first.position.compare(currentPosition) !== "equal") {
        first.position = currentPosition;
        affected.push(first);
      }
      first.previous = undefined!;
    }
    this.#first = first;

    let previous = first;

    // Iterate through the remaining items to update positions and re-link pointers
    for (let i = 1; i < list.length; i++) {
      const item = list[i]!;
      if (!item) continue;

      const next = this.#system.next(currentPosition);
      if (!next.ok) return new Err(LexicalError.from(next.error));
      currentPosition = next.value;

      // Check if the position changed before updating and recording
      if (item.position.compare(currentPosition) !== "equal") {
        item.position = currentPosition;
        affected.push(item);
      }

      previous!.next = item.id;
      item.previous = previous!.id;
      previous = item;
    }

    this.#last = previous;
    if (this.#last) {
      this.#last.next = undefined!;
    }

    // Returns the sorted list
    return new Ok([affected, list]);
  }
  /**
   * Gets the item at an index of the list order, walking from the first item.
   *
   * @param index The 0-based index.
   * @returns A result with the item, or with `undefined` if the index is out of bounds or not a number.
   */
  at(index: number | string | null | undefined): Result<LexicalItem<K, T> | undefined, LexicalError> {
    const v = Number.parseInt(index as any);
    if (Number.isNaN(v) || v < 0) {
      return new Ok(undefined);
    }

    let walker = this.#first;
    let currentIndex = 0;

    while (walker !== undefined) {
      if (currentIndex > this.#list.size) return new Err(LexicalError.mapOverflow());
      if (currentIndex === v) {
        return new Ok(walker);
      }
      walker = this.#list.get(walker.next!);
      currentIndex++;
    }

    return new Ok(undefined);
  }
  /**
   * Gets every item in the list order.
   *
   * @example
   * import Staquia, { LexicalList } from "staquia";
   *
   * const list = new LexicalList(Staquia.create("!", "a", "z", 5, 15, 0.15));
   * list.push({ id: 1, position: "" });
   * list.unshift({ id: 2, position: "" });
   *
   * const items = list.toArray();
   * if (items.ok) console.log(items.value.map((item) => item.id)); // [2, 1]
   *
   * @returns A result with the items, from the first to the last.
   */
  toArray(): Result<LexicalItem<K, T>[], LexicalError> {
    const array: LexicalItem<K, T>[] = new Array(this.#list.size);
    let walker = this.#first;
    let index = 0;
    while (walker) {
      if (index > this.#list.size) return new Err(LexicalError.mapOverflow());
      array[index++] = walker;
      walker = this.#list.get(walker.next!);
    }
    return new Ok(array);
  }
  /** Releases the internal structures. The list can't be used after it. */
  destroy() {
    this.#list.clear();
    this.#list = undefined!;
    this.#selected = undefined!;
    this.#first = undefined!;
    this.#last = undefined!;
  }
}
