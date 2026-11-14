import IPosition from "./position.js";

/**
 * Checks a position you already have against the limits of the system, with the same conditions
 * as the `OverflowError` and the `ThresholdReachedError`. `Staquia` implements it.
 */
export default interface IOverflowVerifier {
  /**
   * Checks if the position is longer than the max length `lmax = ln + lz` of the system,
   * the condition of an `OverflowError`.
   *
   * @param position The position to check.
   *
   * @example
   * import Staquia from "staquia";
   *
   * // lmax = 5 + 15 = 20
   * const system = Staquia.create("!", "a", "z", 5, 15, 0.15);
   *
   * const start = system.start(); // "mmmmm!", 6 characters
   * if (start.ok) console.log(system.hasOverflow(start.value)); // false
   */
  hasOverflow(position: IPosition): boolean;
  /**
   * Checks if the length of the position reached the threshold `lϰ = ceil((1 - fϰ) * lmax)`,
   * the condition of a `ThresholdReachedError`.
   *
   * @param position The position to check.
   *
   * @example
   * import Staquia from "staquia";
   *
   * // lϰ = ceil((1 - 0.15) * 20) = 17
   * const system = Staquia.create("!", "a", "z", 5, 15, 0.15);
   *
   * // A position of 17 characters is valid, but it comes inside the error
   * const long = system.forge("mmmmmmmmmmmmmmmmm");
   * if (!long.ok && "position" in long.error) {
   *   console.log(system.isThresholdReached(long.error.position)); // true
   *   console.log(system.hasOverflow(long.error.position)); // false
   * }
   */
  isThresholdReached(position: IPosition): boolean;
}
