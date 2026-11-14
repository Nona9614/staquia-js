// Intefaces
import INumberSystem from "../interfaces/number-system.js";
import IPosition from "../interfaces/position.js";

/**
 * Returned (never thrown) when there is no valid position to create:
 * - the new position would be longer than the max length `lmax = ln + lz` of the system, or
 * - `next` was asked for an `N` that is already the last value (every digit is `last`), or `previous`
 *   for an `N` that is already the first one (every digit is `zero`).
 *
 * The positions must be spaced again (`LexicalList.sort`) before inserting there.
 *
 * @example
 * import Staquia, { OverflowError } from "staquia";
 *
 * const system = Staquia.create("!", "a", "z", 5, 15, 0.15);
 *
 * const result = system.next(system.forge("zzzzz"));
 * if (!result.ok && result.error instanceof OverflowError) {
 *   console.log(result.error.position.toString()); // "zzzzz!", the position that can't move
 * }
 *
 * @group Errors
 */
export default class OverflowError extends Error {
  #position: IPosition;

  /** Always `true`: identifies an `OverflowError` without `instanceof`. */
  get isOverflow(): true {
    return true;
  }

  /** The position that overflowed, or the one that has no `next`/`previous` value. */
  get position() {
    return this.#position;
  }

  constructor(message: string, position: IPosition) {
    super(message);
    this.#position = position;
  }

  /**
   * Creates the error for a position longer than the max length `lmax` of the system.
   *
   * @param system The system of the position.
   * @param position The position that is too long.
   */
  static create(system: INumberSystem, position: IPosition) {
    const string = position.toString();
    const length = position.n.upperBound + position.z.upperBound + 2;
    const lmax = system.lmax;
    const message = `The position "${string}" caused an overflow as its length '${length}' is bigger than the allowed system length '${lmax}'.`;
    return new OverflowError(message, position);
  }

  /**
   * Creates an overflow for a position whose `n` section is already at its limit, so there is
   * no `next` (all digits are the last value) or `previous` (all digits are zero) value for it.
   *
   * @param position The position that can't move in the requested direction.
   * @param direction The direction that was requested.
   */
  static limit(position: IPosition, direction: "next" | "previous") {
    const edge = direction === "next" ? "last" : "first";
    const message = `The position "${position.toString()}" has no ${direction} value as its 'n' section is already the ${edge} value of the system.`;
    return new OverflowError(message, position);
  }
}
