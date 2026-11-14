// Interfaces
import IOrdinal from "./ordinal.js";
import IClonable from "../../src/interfaces/clonable.js";

/**
 * A number as a map of digits by key: the key is the power of the base, so a higher key is a more
 * significant digit, and negative keys are the digits after the point. See `Digits`.
 */
export default interface IDigits extends IOrdinal<IDigits>, IClonable<IDigits> {
  /** The digits by key. */
  _map: Map<number, number>;
  /** The key of the most significant digit. */
  upperBound: number;
  /** The key of the least significant digit. */
  lowerBound: number;
  /**
   * Moves the digits and bounds of another number into this one, without copying them.
   * The other number is left without digits and must not be used after it.
   * @param number The number to take the digits from.
   */
  reference(number: IDigits): void;
  /**
   * Gets the digit at a key, `0` if there is none.
   * @param key The key of the digit.
   */
  get(key: number): number;
  /**
   * Sets the digit at a key.
   * @param key The key of the digit.
   * @param value The digit.
   */
  set(key: number, value: number): void;
  /**
   * Adds an offset to the digit at a key. It doesn't carry: `resolveOverflow` does.
   * @param key The key of the digit.
   * @param offset The value to add (negative to subtract).
   */
  update(key: number, offset: number): void;
  /**
   * Adds the digits of another number above the most significant digit of this one.
   * @param other The number whose digits are added.
   */
  stack(other: IDigits): void;
  /**
   * Removes the zeroes from the most significant side (the leading zeroes). A number of only
   * zeroes keeps a single `0`.
   */
  compact(): void;
  /**
   * Adds zeroes above the most significant digit (on the <b>left</b> of the number).
   * @param size How many zeroes to add.
   */
  expand(size: number): void;
  /**
   * Shifts the digits up and adds zeroes at the lowest keys (on the <b>right</b> of the number),
   * like multiplying it by `base ^ size`.
   * @param size How many zeroes to add.
   */
  extend(size: number): void;
  /**
   * Removes the most significant digit.
   */
  pop(): void;
  /**
   * Removes the digit at a key.
   * @param key The key of the digit.
   * @returns `true` if there was a digit to remove, `false` otherwise.
   */
  remove(key: number): boolean;
  /**
   * Checks if the digit at a key is `0` (or missing).
   * @param key The key of the digit.
   */
  isKeyZero(key: number): boolean;
  /**
   * Checks if the number is a single `0`: both bounds are `0` and the digit at the key `0` is `0` or missing.
   */
  isZero(): boolean;
  /**
   * Checks if the number has no digit set at all: nothing at the key `0` and both bounds `0`.
   */
  isEmpty(): boolean;
}
