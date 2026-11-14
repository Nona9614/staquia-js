// Entities
import Staquia from "../entities/staquia.js";
// Errors
import { IPositionError } from "../errors/position-error.js";
// Results
import { Ok, Result } from "../result.js";
// Interfaces
import IPosition from "../interfaces/position.js";

/**
 * The fields an object needs to be stored in a `LexicalList`. Your objects can have any other field.
 *
 * @template K The type of the `id`.
 *
 * @example
 * import type { Item } from "staquia";
 *
 * interface Task extends Item<number> {
 *   title: string;
 * }
 *
 * // A new object starts with an empty position: the list gives it one
 * const task: Task = { id: 1, title: "Write", position: "" };
 */
export interface Item<K> {
  /** The unique identifier of the object, never `null` or `undefined`. */
  id: K;
  /** The position of the object as a string, kept in sync by the list. Store it and sort by it. */
  position: string;
}

/**
 * An object stored in a `LexicalList`, with its position and the ids of its neighbors.
 *
 * Setting its `position` also updates the `position` string of the wrapped object, so your object
 * is always ready to be saved.
 *
 * @template K The type of the `id`.
 * @template T The type of the wrapped object.
 *
 * @example
 * import Staquia, { LexicalList } from "staquia";
 *
 * const list = new LexicalList(Staquia.create("!", "a", "z", 5, 15, 0.15));
 * list.push({ id: 1, position: "" });
 * list.push({ id: 2, position: "" });
 *
 * const item = list.find(2);
 * if (item) {
 *   console.log(item.position.toString()); // "mmmmn!"
 *   console.log(item.previous, item.next); // 1 undefined
 * }
 */
export default class LexicalItem<K, T extends Item<K>> {
  #value: T;
  #position: IPosition;

  /** The id of the previous item in the list, or `undefined` if this is the first one. */
  previous?: K;
  /** The id of the next item in the list, or `undefined` if this is the last one. */
  next?: K;

  /** The id of the wrapped object. */
  get id(): K {
    return this.#value.id;
  }
  /** The value that the lexical item wraps. */
  get value(): T {
    return this.#value;
  }
  /** The position of the item. */
  get position(): IPosition {
    return this.#position;
  }
  /** Sets the position of the item and the `position` string of the wrapped object. */
  set position(v: IPosition) {
    this.#value.position = v.toString();
    this.#position = v;
  }

  /**
   * Wraps an object with a position, writing it to the object's `position` field.
   * The list creates its items: use `LexicalItem.from` to create one from a stored position.
   *
   * @param value The object to wrap.
   * @param position Its position.
   */
  constructor(value: T, position: IPosition) {
    this.#value = value;
    this.#position = position;
    value.position = position.toString();
  }

  /**
   * Creates an item from an object whose `position` string is already set, forging it with the system.
   *
   * @param system The system that created the position.
   * @param value The object, with its stored `position` string.
   *
   * @template K The type of the `id`.
   * @template T The type of the wrapped object.
   *
   * @example
   * import Staquia, { LexicalItem } from "staquia";
   *
   * const system = Staquia.create("!", "a", "z", 5, 15, 0.15);
   *
   * const item = LexicalItem.from(system, { id: 7, position: "mmmmm!" });
   * if (item.ok) console.log(item.value.position.toString()); // "mmmmm!"
   *
   * @returns The item, or the error of `system.forge` (e.g. an `InvalidCharacterError`).
   */
  static from<K, T extends Item<K>>(system: Staquia, value: T): Result<LexicalItem<K, T>, IPositionError> {
    const _position = system.forge(value.position);
    if (!_position.ok) return _position;
    const item = new LexicalItem<K, T>(value, _position.value);
    return new Ok(item);
  }
}
