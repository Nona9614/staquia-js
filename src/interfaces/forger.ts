import IDigits from "./digits.js";
import IPosition from "./position.js";
import { IPositionResult } from "../results/position-result.js";

/**
 * Creates positions with a number system. `Staquia` implements it.
 *
 * Every function returns a `Result` instead of throwing: check `result.ok`, then read `result.value`
 * (the position) or `result.error` (why it failed).
 *
 * `next`, `previous` and `core` also accept a result, so calls can be chained without unwrapping them.
 * Once a result fails, its error is passed along and no new positions are created.
 */
export default interface IForger {
  /**
   * Creates a position from its digits, the inverse of `position.digits()`.
   *
   * The digits are split in the `N` and `Z` sections of the system: `N` takes the `ln` most significant digits.
   *
   * @param number The digits of the position.
   *
   * @example
   * import Staquia from "staquia";
   *
   * const system = Staquia.create("!", "a", "z", 5, 15, 0.15);
   * const start = system.start();
   *
   * if (start.ok) {
   *   // Rebuilds the same position from its digits
   *   const copy = system.from(start.value.digits());
   *   if (copy.ok) console.log(copy.value.toString()); // "mmmmm!"
   * }
   *
   * @returns The position, or the error if it is too long (`OverflowError`) or reached the threshold (`ThresholdReachedError`).
   */
  from(number: IDigits): IPositionResult;
  /**
   * Creates a position from its string, for example one stored in a database.
   *
   * When the string is shorter than the `N` section (`ln` characters), `N` is completed with zeroes
   * **to the right**, which keeps the string order (`"xy"` becomes `"xy!!!!"`).
   *
   * @param string The string representation of the position.
   *
   * @example
   * import Staquia, { InvalidCharacterError } from "staquia";
   *
   * const system = Staquia.create("!", "a", "z", 5, 15, 0.15);
   *
   * const xy = system.forge("xy");
   * if (xy.ok) console.log(xy.value.toString()); // "xy!!!!"
   *
   * // Every character must be a digit of the system: the zero or a character from first to last
   * const invalid = system.forge("abC");
   * if (!invalid.ok && invalid.error instanceof InvalidCharacterError) {
   *   console.log(invalid.error.index); // 2
   * }
   *
   * @returns The position, or the error: `InvalidCharacterError` for a character that is not a digit of the system,
   * `OverflowError` if it is too long, `ThresholdReachedError` if it reached the threshold.
   */
  forge(string: string): IPositionResult;
  /**
   * Creates the recommended first position of a list: the middle digit repeated in the whole `N` section,
   * so there is the same room to stack items before and after it.
   *
   * @example
   * import Staquia from "staquia";
   *
   * // The middle digit of "a" to "z" (with the zero "!") is "m"
   * const system = Staquia.create("!", "a", "z", 5, 15, 0.15);
   *
   * const start = system.start();
   * if (start.ok) console.log(start.value.toString()); // "mmmmm!"
   *
   * @returns The start position.
   */
  start(): IPositionResult;
  /**
   * Creates a position between two others, to move or insert an item between its neighbors.
   *
   * The room left in the `N` section is used first. When the positions are adjacent, the `Z` section
   * takes the middle value, making the position one digit longer. Moving items again and again into
   * the same gap makes positions grow until the threshold (`ThresholdReachedError`) and the overflow (`OverflowError`).
   *
   * @param previous The position that must be before the new one (or a result with it).
   * @param next The position that must be after the new one (or a result with it).
   *
   * @example
   * import Staquia from "staquia";
   *
   * const system = Staquia.create("!", "a", "z", 5, 15, 0.15);
   * const start = system.start(); // "mmmmm!"
   * const next = system.next(start); // "mmmmn!"
   *
   * // Adjacent positions: Z takes the middle value
   * const core = system.core(start, next);
   * if (core.ok) console.log(core.value.toString()); // "mmmmmn"
   *
   * // There is room in N between "a!!!!!" and "b!!!!!"
   * const room = system.core(system.forge("a"), system.forge("b"));
   * if (room.ok) console.log(room.value.toString()); // "ammmn!"
   *
   * @returns The position between `previous` and `next`, or the error (including a `SystemMismatchError`
   * if a position was created by a system with another configuration).
   */
  core(previous: IPosition | IPositionResult, next: IPosition | IPositionResult): IPositionResult;
  /**
   * Creates the position right after another, to stack an item at the end of a list.
   *
   * It adds `1` to the `N` section, so the position never gets longer. When `N` is already its
   * last value (every digit is `last`) it fails with an `OverflowError`.
   *
   * @param reference The position to start from (or a result with it).
   *
   * @example
   * import Staquia from "staquia";
   *
   * const system = Staquia.create("!", "a", "z", 5, 15, 0.15);
   *
   * const next = system.next(system.start());
   * if (next.ok) console.log(next.value.toString()); // "mmmmn!"
   *
   * // Results can be chained, an error is passed along
   * const third = system.next(system.next(system.start()));
   * if (third.ok) console.log(third.value.toString()); // "mmmmo!"
   *
   * // "zzzzz" is the last value of N
   * const overflow = system.next(system.forge("zzzzz"));
   * console.log(overflow.ok); // false, an OverflowError
   *
   * @returns The next position, or the error.
   */
  next(reference: IPosition | IPositionResult): IPositionResult;
  /**
   * Creates the position right before another, to stack an item at the start of a list.
   *
   * It subtracts `1` from the `N` section, so the position never gets longer. When `N` is already
   * its first value (every digit is `zero`) it fails with an `OverflowError`.
   *
   * @param reference The position to start from (or a result with it).
   *
   * @example
   * import Staquia from "staquia";
   *
   * const system = Staquia.create("!", "a", "z", 5, 15, 0.15);
   *
   * const previous = system.previous(system.start());
   * if (previous.ok) console.log(previous.value.toString()); // "mmmml!"
   *
   * // "!!!!!" is the first value of N
   * const overflow = system.previous(system.forge("!!!!!"));
   * console.log(overflow.ok); // false, an OverflowError
   *
   * @returns The previous position, or the error.
   */
  previous(reference: IPosition | IPositionResult): IPositionResult;
}
