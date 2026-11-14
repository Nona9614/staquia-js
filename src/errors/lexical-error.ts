import { IPositionError } from "./position-error.js";

/**
 * Why a `LexicalList` operation failed:
 * - `"not-found"`: the item, or a neighbor passed to `move`, is not in the list.
 * - `"not-adjacent"`: the neighbors passed to `move` are not next to each other.
 * - `"position"`: a position could not be created (threshold or overflow), or is empty or invalid.
 * - `"invalid-id"`: an item with a `null` or `undefined` id.
 * - `"duplicate-id"`: an item with an id that is already in the list.
 * - `"not-ordered"`: `set` received items that are not sorted by position.
 * - `"map-overflow"`: the list structure is corrupted.
 */
export type LexicalErrorType = "map-overflow" | "not-found" | "position" | "not-adjacent" | "invalid-id" | "duplicate-id" | "not-ordered";

/**
 * Returned (never thrown) when a `LexicalList` operation fails; its `type` tells why. When an operation
 * returns an error, neither the list nor your objects were changed.
 *
 * @example
 * import Staquia, { LexicalList } from "staquia";
 *
 * const list = new LexicalList(Staquia.create("!", "a", "z", 5, 15, 0.15));
 *
 * const result = list.move(9, 1, 2);
 * if (!result.ok) console.log(result.error.type); // "not-found"
 *
 * @group Errors
 */
export default class LexicalError extends Error {
  #type: LexicalErrorType;

  /** Why the operation failed, see `LexicalErrorType`. */
  get type() {
    return this.#type;
  }

  /**
   * Creates an instance of a LexicalError.
   *
   * @param message The human-readable error description.
   * @param type The category of the lexical error.
   */
  constructor(message: string, type: LexicalErrorType) {
    super(message);
    this.#type = type;
  }

  /**
   * Creates a LexicalError from an underlying position calculation error.
   *
   * @param error The position error to wrap.
   */
  static from(error: IPositionError) {
    return new LexicalError(error.message, "position");
  }

  /**
   * Creates a LexicalError representing a map traversal overflow.
   */
  static mapOverflow() {
    return new LexicalError("Overflow while traversing the map.", "map-overflow");
  }

  /**
   * Creates a LexicalError representing a missing item lookup.
   *
   * @param id The identifier that failed to match any existing item.
   */
  static notFound(id: unknown) {
    return new LexicalError(`The item was not found using the id '${id}'.`, "not-found");
  }

  /**
   * Creates a LexicalError representing neighbors that are not adjacent in the list.
   *
   * @param message The description of the invalid neighbors.
   */
  static notAdjacent(message: string) {
    return new LexicalError(message, "not-adjacent");
  }

  /**
   * Creates a LexicalError representing an item whose id can't be stored in the list.
   *
   * @param id The invalid identifier (`null` or `undefined`).
   */
  static invalidId(id: unknown) {
    return new LexicalError(`The item id can't be '${id}', null and undefined ids are not allowed.`, "invalid-id");
  }

  /**
   * Creates a LexicalError representing an item whose id is already stored in the list.
   *
   * @param id The duplicated identifier.
   */
  static duplicateId(id: unknown) {
    return new LexicalError(`The item id '${id}' already exists in the list.`, "duplicate-id");
  }

  /**
   * Creates a LexicalError representing an item whose position is empty or can't be forged.
   *
   * @param id The identifier of the item.
   * @param position The invalid position.
   * @param reason Why the position is not valid.
   */
  static invalidPosition(id: unknown, position: string, reason: string) {
    return new LexicalError(
      `The item (id: ${id}) has the invalid position '${position}'. ${reason} Use the 'untrusted' option to repair it.`,
      "position",
    );
  }

  /**
   * Creates a LexicalError representing values whose positions are not in ascending order.
   *
   * @param index The index of the first value that breaks the order.
   * @param previousId The id of the value before it.
   * @param previous The position of the value before it.
   * @param id The id of the value that breaks the order.
   * @param position Its position.
   */
  static notOrdered(index: number, previousId: unknown, previous: string, id: unknown, position: string) {
    return new LexicalError(
      `The positions are not in ascending order (index ${index}: id ${id} '${position}' is not after id ${previousId} '${previous}'). ` +
        `Use the 'untrusted' option to sort and repair them.`,
      "not-ordered",
    );
  }
}
