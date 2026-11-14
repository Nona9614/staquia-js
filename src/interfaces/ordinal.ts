// Unions
import Ordering from "../unions/ordering.js";

/**
 * Explicit comparisons between two objects of the same kind. Positions implement it, and the result
 * always agrees with the order of their strings.
 *
 * @template T The type of the compared objects.
 */
export default interface IOrdinal<T> {
  /**
   * Checks if `this` and `other` have the same value.
   *
   * @param other The object to compare with.
   *
   * @example
   * import Staquia from "staquia";
   *
   * const system = Staquia.create("!", "a", "z", 5, 15, 0.15);
   * const a = system.forge("mmmmm");
   * const b = system.forge("mmmmm!");
   *
   * // Zeroes to the right don't change the value
   * if (a.ok && b.ok) console.log(a.value.equal(b.value)); // true
   *
   * @returns `true` if both have the same value.
   */
  equal(other: T): boolean;
  /**
   * Compares `this` with `other`, like a sort comparator.
   *
   * @param other The object to compare with.
   *
   * @example
   * import Staquia from "staquia";
   *
   * const system = Staquia.create("!", "a", "z", 5, 15, 0.15);
   * const a = system.forge("mmmmm!m");
   * const b = system.forge("mmmmn");
   *
   * if (a.ok && b.ok) console.log(a.value.compare(b.value)); // "less"
   *
   * @returns `"less"` if `this` goes before `other`, `"equal"` if they have the same value, `"greater"` if it goes after.
   */
  compare(other: T): Ordering;
  /**
   * Checks if `this` goes **after** `other`.
   *
   * @param this The left side of the comparison.
   * @param other The right side of the comparison.
   * @returns `true` if `this > other`.
   */
  greater(this: T, other: T): boolean;
  /**
   * Checks if `this` goes **after** `other` or has the same value.
   *
   * @param this The left side of the comparison.
   * @param other The right side of the comparison.
   * @returns `true` if `this >= other`.
   */
  greaterOrEqual(this: T, other: T): boolean;
  /**
   * Checks if `this` goes **before** `other`.
   *
   * @param this The left side of the comparison.
   * @param other The right side of the comparison.
   *
   * @example
   * import Staquia from "staquia";
   *
   * const system = Staquia.create("!", "a", "z", 5, 15, 0.15);
   * const a = system.forge("mmmmm!m");
   * const b = system.forge("mmmmn");
   *
   * if (a.ok && b.ok) {
   *   console.log(a.value.less(b.value)); // true
   *   console.log(a.value.greater(b.value)); // false
   * }
   *
   * @returns `true` if `this < other`.
   */
  less(this: T, other: T): boolean;
  /**
   * Checks if `this` goes **before** `other` or has the same value.
   *
   * @param this The left side of the comparison.
   * @param other The right side of the comparison.
   * @returns `true` if `this <= other`.
   */
  lessOrEqual(this: T, other: T): boolean;
}
