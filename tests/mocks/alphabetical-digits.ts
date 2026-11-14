// Interfaces
import IDigits from "../../src/interfaces/digits.js";
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
} from "../../src/aggregates/number/index.js";

export default class AlphabeticalDigits implements IDigits {
  /** The internal dictionary of the number */
  _map: Map<number, number> = new Map();
  lowerBound: number = 0;
  upperBound: number = 0;

  /**
   * Creates a new instance from the bound values.
   * 
   * @param digits The `string` containting the digits and positions to be mapped
   */
  static from(digits: string) {
    const number = new AlphabeticalDigits();
    const map = new Map();
    let ix: number;
    for (let i = 0; i < digits.length; i++) {
      ix = digits.length - i - 1;
      const digit = digits[ix];
      if (digit === "!") {
        map.set(i, 0);
      } else {
        const code = digits[ix].charCodeAt(0) - 96;
        map.set(i, code);
      }
    }
    number._map = map;
    number.lowerBound = 0;
    number.upperBound = digits.length - 1;
    return number;
  }

  /** Transforms back to a string */
  toString() {
    let _string = "";
    for (let i = this.lowerBound; i <= this.upperBound; i++) {
      const value = this.get(i);
      if (value === 0) {
        _string = "!" + _string;
      } else {
        _string = String.fromCodePoint(value + 96) + _string;
      }
    }
    return _string;
  }

  get = getDigit;
  set = setDigit;
  reference = reference;
  update = update;
  stack = stack;
  compact = compact;
  expand = expand;
  extend = extend;
  pop = pop;
  remove = remove;
  clone = clone(AlphabeticalDigits);
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
