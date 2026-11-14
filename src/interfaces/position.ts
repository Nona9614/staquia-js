import IDigits from "./digits.js";
import IOrdinal from "./ordinal.js";

/**
 * A position: the place of an item in a list, created by a `Staquia` system.
 *
 * It has two sections, printed one after the other:
 *  - `N`, with a fixed length (`ln`): it moves up and down to stack items at the start or the end.
 *  - `Z`, with a flexible length (up to `lz`): it grows when an item is placed between two others.
 *
 * A position only contains data and keeps no reference to its system. Store it as a string
 * (`toString()`) and recreate it with `system.forge(string)`.
 *
 * @example
 * import Staquia from "staquia";
 *
 * const system = Staquia.create("!", "a", "z", 5, 15, 0.15);
 *
 * const position = system.forge("mmmmm!m");
 * if (position.ok) {
 *   console.log(position.value.toString()); // "mmmmm!m", N = "mmmmm" and Z = "!m"
 *   console.log(position.value.length); // 7
 * }
 */
export default interface IPosition extends IOrdinal<IPosition> {
  /** The digits of the `N` section. */
  n: IDigits;
  /** The digits of the `Z` section. */
  z: IDigits;
  /** The length of the position string (`N` plus `Z`). */
  readonly length: number;
  /**
   * Gets all the digits of the position in a single number: `N` as the integer part and `Z` below it.
   * It is used to compare positions, and `system.from` creates a position back from it.
   */
  digits(): IDigits;
  /**
   * Builds the string of the position with the characters of the system that created it.
   * This is the value to store and to sort by.
   *
   * @example
   * import Staquia from "staquia";
   *
   * const system = Staquia.create("!", "a", "z", 5, 15, 0.15);
   *
   * const next = system.next(system.start());
   * if (next.ok) {
   *   console.log(next.value.toString()); // "mmmmn!"
   *   console.log(`${next.value}`); // "mmmmn!", also in templates and String()
   * }
   */
  toString(): string;
}
