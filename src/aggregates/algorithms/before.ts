// Interfaces
import IAlgorithms from "../../interfaces/algorithms.js";
import IDigits from "../../interfaces/digits.js";
import INumberSystem from "../../interfaces/number-system.js";

export default function before(this: INumberSystem & IAlgorithms, value: IDigits, trim: boolean = false) {
  // Creates a copy of the current number
  let number = value.clone();
  // Removes one to the start value
  number.update(0, -1);
  // If trim is set, removes all leading zeroes
  trim && number.compact();
  // Adds extra space in case of overflow
  number.expand(1);
  // Carry values until the number is not negative
  let base = this.base;
  let _v: number;
  for (let n = number.lowerBound; n <= number.upperBound; n++) {
    _v = number.get(n);
    if (_v < 0) {
      number.update(n, base);
      number.update(n + 1, -1);
    } else {
      break;
    }
  }
  // If the expanded final digit is 0, remove it again
  if (number.get(number.upperBound) <= 0) {
    number.pop();
  }
  // Returns the generated number
  return number;
}
