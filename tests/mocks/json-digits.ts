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

export default class JsonDigits implements IDigits {
  /** The internal dictionary of the number */
  _map!: Map<number, number>;
  lowerBound!: number;
  upperBound!: number;

  /**
   * Creates a new instance from the bound values.
   * @param digits The object containting the digits and positions to be mapped
   */
  static from(digits: Record<number, number>) {
    let upperBound = 0;
    let lowerBound = 0;
    const number = new JsonDigits();
    const map = new Map();
    for (const [_key, value] of Object.entries(digits)) {
      const key = Number(_key);
      if (lowerBound > key) lowerBound = key;
      if (upperBound < key) upperBound = key;
      map.set(key, value);
    }
    number._map = map;
    number.lowerBound = lowerBound;
    number.upperBound = upperBound;
    return number;
  }

  toJson() {
    const object: Record<number, number> = {};
    for (const [key, value] of this._map.entries()) {
      object[key] = value;
    }
    return object;
  }

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
  clone = clone(JsonDigits);
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
