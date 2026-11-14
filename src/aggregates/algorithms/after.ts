// Interfaces
import IAlgorithms from "../../interfaces/algorithms.js";
import IDigits from "../../interfaces/digits.js";
import INumberSystem from "../../interfaces/number-system.js";

/**
 * Returns the following value of the given number
 * @param trim If set, removes all leading zeroes
 */
export default function after(this: INumberSystem & IAlgorithms, value: IDigits, trim: boolean = false) {
  // Creates a copy of the current number
  let number = value.clone();
  // Adds one to the start value
  number.update(0, 1);
  // If trim is set, removes all leading zeroes
  trim && number.compact();
  // Adds extra space in case of overflow
  number.expand(1);
  // Resolves the overflow
  this.resolveOverflow(number);
  // If the expanded final digit is 0, remove it again
  if (number.isKeyZero(number.upperBound)) {
    number.pop();
  }
  // Returns the generated number
  return number;
}
