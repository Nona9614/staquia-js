// Number
import create from "../number/create.js";
// Interfaces
import IAlgorithms from "../../interfaces/algorithms.js";
import ICrafter from "../../interfaces/crafter.js";
import IDigits from "../../interfaces/digits.js";

/**
* Checks when a value is between two `string` values such that:
     `before` < `value` < `after`
     * `value` - The value that will be checked to be beween the `numbers`
     * `before` - The lower bound `number`
     * `after` - The upper bound `number`
    * @returns the cleaned number
 */
export default function clean(this: IAlgorithms & ICrafter, value: IDigits, before: IDigits, after: IDigits): IDigits {
  const number = create(this.number);

  let n = value.upperBound;

  const br = value.lowerBound - 1;
  let beforeIndex = br;
  let afterIndex = br;

  let beforeCode: number;
  let valueCode: number;
  let afterCode: number;
  while (beforeIndex == br && afterIndex == br && n >= value.lowerBound) {
    beforeCode = before.get(n);
    valueCode = value.get(n);
    afterCode = after.get(n);

    if (beforeCode < valueCode) beforeIndex = n;
    if (valueCode < afterCode) afterIndex = n;
    if (beforeIndex != br || afterIndex != br) break;
    n--;
  }

  if (beforeIndex == br && afterIndex == br) return value;

  if (afterIndex == br) {
    while (afterIndex == br && n >= value.lowerBound) {
      valueCode = value.get(n);
      afterCode = after.get(n);
      if (valueCode < afterCode) {
        afterIndex = n;
        break;
      }
      n--;
    }
    if (afterIndex == br) return value;
  } else {
    while (beforeIndex == br && n >= value.lowerBound) {
      beforeCode = before.get(n);
      valueCode = value.get(n);
      if (beforeCode < valueCode) {
        beforeIndex = n;
        break;
      }
      n--;
    }
    if (beforeIndex == br) return value;
  }

  number.upperBound = value.upperBound - n + value.lowerBound;
  number.lowerBound = value.lowerBound;
  let i: number = br;
  for (i = value.upperBound; i >= n; i--) {
    valueCode = value.get(i);
    number.set(i - n + value.lowerBound, valueCode);
  }

  return number;
}
