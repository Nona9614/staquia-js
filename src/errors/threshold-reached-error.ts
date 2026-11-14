// Intefaces
import INumberSystem from "../interfaces/number-system.js";
import IPosition from "../interfaces/position.js";

/**
 * Returned (never thrown) when a new position **reaches** the threshold length `lϰ = ceil((1 - fϰ) * lmax)`:
 * an early warning before the overflow.
 *
 * The position is still valid and comes inside the error (`error.position`), so it can be used,
 * but it is time to space the positions again (`LexicalList.sort`).
 *
 * @example
 * import Staquia, { ThresholdReachedError } from "staquia";
 *
 * // lϰ = ceil((1 - 0.15) * 20) = 17
 * const system = Staquia.create("!", "a", "z", 5, 15, 0.15);
 *
 * const result = system.forge("mmmmmmmmmmmmmmmmm"); // 17 characters
 * if (!result.ok && result.error instanceof ThresholdReachedError) {
 *   // Still valid: use it, and rebalance soon
 *   console.log(result.error.position.toString()); // "mmmmmmmmmmmmmmmmm"
 * }
 *
 * @group Errors
 */
export default class ThresholdReachedError extends Error {
  #position: IPosition;

  /** Always `true`: identifies a `ThresholdReachedError` without `instanceof`. */
  get isDangerous(): true {
    return true;
  }

  /** The position that reached the threshold. It is valid and can still be used. */
  get position() {
    return this.#position;
  }

  constructor(message: string, position: IPosition) {
    super(message);
    this.#position = position;
  }

  /**
   * Creates the error for a position that reached the threshold length `lϰ` of the system.
   *
   * @param system The system of the position.
   * @param position The position that reached the threshold.
   */
  static create(system: INumberSystem, position: IPosition) {
    const string = position.toString();
    const length = position.n.upperBound + position.z.upperBound + 2;
    const lϰ = system.lϰ;
    const diff = system.lmax - lϰ;
    const message = `The position "${string}" with '${length}' reached the thereshold '${lϰ}'.\nThe system is about '${diff}' character's length before it causes an overflow.`;
    return new ThresholdReachedError(message, position);
  }
}
