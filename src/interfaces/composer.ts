// Interfaces
import IDigits from "./digits.js";
import IPosition from "./position.js";

/**
 * Internal: converts between strings, numbers and positions with the characters of a system.
 */
export default interface IComposer {
  /**
   * Converts a position to a single number (`N` followed by `Z`).
   * @param position The position to convert.
   * @param length The minimum number of digits, completed with zeroes if the position is shorter.
   */
  raw(position: IPosition, length: number): IDigits;
  /**
   * Converts a number to its string with the system characters.
   * @param number The number to convert.
   */
  reduce(number: IDigits): string;
  /**
   * Converts a string to a number: the last character is the key `0`, the one before it the key `1`, and so on.
   * @param string The string to convert.
   */
  compose(string: string): IDigits;
}
