/**
 * The configuration of a number system: its digits (characters by their unicode value) and its lengths.
 */
export default interface INumberSystem {
  /** The character of the zero digit. */
  zero: string;
  /** The character of the first digit (`1`). */
  first: string;
  /** The character of the last digit (`base - 1`). */
  last: string;
  /** The number of digits, including the zero: `(last - first) + 2`. */
  base: number;
  /** The factor `fϰ` (`0` to `1`) that sets the threshold length `lϰ`. */
  ϰ: number;
  /** The fixed length of the `N` section. */
  ln: number;
  /** The max length of the `Z` section. */
  lz: number;
  /** The max length of a position: `ln + lz`. Longer positions are an `OverflowError`. */
  lmax: number;
  /**
   * The threshold length: `ceil((1 - ϰ) * lmax)`. Positions that reach it are returned
   * inside a `ThresholdReachedError`, an early warning before the overflow.
   */
  lϰ: number;
}
