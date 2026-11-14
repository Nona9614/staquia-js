// Interfaces
import IDigits from "../interfaces/digits.js";
// Aggreagates
import {
  clone,
  compact,
  compare,
  equal,
  expand,
  extend,
  getDigit,
  greater,
  greaterOrEqual,
  isEmpty,
  isKeyZero,
  isZero,
  less,
  lessOrEqual,
  pop,
  reference,
  remove,
  setDigit,
  stack,
  update,
} from "../aggregates/number/index.js";

/**
 * The default class of the numbers: the digits of a number in the base of a system, stored by key.
 * The key is the power of the base, so a higher key is a more significant digit: the base 10 number
 * `123` is `1` at the key `2`, `2` at the key `1` and `3` at the key `0`. Negative keys are the digits
 * after the point.
 *
 * The systems create and initialize their numbers, you get them from a position with `digits()`.
 * Extend it to replace the numbers of a system, see `IStaquiaOptions`.
 *
 * @example
 * import Staquia from "staquia";
 *
 * const system = Staquia.create("!", "a", "z", 5, 15, 0.15);
 *
 * const next = system.next(system.start()); // "mmmmn!"
 * if (next.ok) {
 *   const digits = next.value.digits();
 *   console.log(digits.upperBound, digits.lowerBound); // 4 -1
 *   console.log(digits.get(4), digits.get(0)); // 13 14, "m" and "n"
 * }
 */
class Digits implements IDigits {
  /** The digits by key (the power of the base). */
  _map!: Map<number, number>;
  lowerBound!: number;
  upperBound!: number;

  get = getDigit;
  set = setDigit;
  update = update;
  stack = stack;
  reference = reference;
  compact = compact;
  expand = expand;
  extend = extend;
  pop = pop;
  remove = remove;
  clone = clone(Digits);
  isKeyZero = isKeyZero;
  isZero = isZero;
  isEmpty = isEmpty;
  equal = equal;
  compare = compare;
  greater = greater;
  greaterOrEqual = greaterOrEqual;
  less = less;
  lessOrEqual = lessOrEqual;
}

export default Digits;
