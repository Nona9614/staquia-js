// Intefaces
import IPosition from "../interfaces/position.js";

/**
 * Returned (never thrown) by `next`, `previous` and `core` when a position was created by a system with a
 * different configuration (`zero`, `first`, `last` or `ln`). Each configuration gives the digits a different
 * meaning, so mixing them would create invalid positions. Systems with the same configuration share positions.
 *
 * @example
 * import Staquia, { SystemMismatchError } from "staquia";
 *
 * const alphabet = Staquia.create("!", "a", "z", 5, 15, 0.15);
 * const digits = Staquia.create("#", "0", "9", 5, 15, 0.15);
 *
 * const result = alphabet.next(digits.start());
 * if (!result.ok) console.log(result.error instanceof SystemMismatchError); // true
 *
 * @group Errors
 */
export default class SystemMismatchError extends Error {
  #position: IPosition;

  /** Always `true`: identifies a `SystemMismatchError` without `instanceof`. */
  get isMismatch(): true {
    return true;
  }

  /** The position that does not belong to the system. */
  get position() {
    return this.#position;
  }

  constructor(message: string, position: IPosition) {
    super(message);
    this.#position = position;
  }

  /**
   * Creates the error for a position of another system.
   *
   * @param position The position that does not belong to the system.
   */
  static create(position: IPosition) {
    const message = `The position "${position.toString()}" was created by a system with a different configuration, positions of different systems can't be mixed.`;
    return new SystemMismatchError(message, position);
  }
}
