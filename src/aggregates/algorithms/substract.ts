// Number
import create from "../number/create.js";
// Interfaces
import INumberSystem from "../../interfaces/number-system.js";
import ISignedDigits from "../../interfaces/signed-digits.js";
import IDigits from "../../interfaces/digits.js";
import ICrafter from "../../interfaces/crafter.js";

/**
 * It will subtract two numbers and return the result and if it is negative.
 * @param left The left handsiede `number`
 * @param right The right handsiede `number`
 * @returns A number containing the subtraction information.
 */
export default function substract(this: INumberSystem & ICrafter, left: IDigits, right: IDigits): ISignedDigits {
  // If the difference from the above number is smaller than the previous
  // carry until are values are lined or the final number is reached, example:
  //      c     !     ! -
  //      !     !     z =
  //      ---------------
  //      c     !   (-z)
  //      ---------------
  //      c   (!-a)(a!-z)
  //      ---------------
  //      c   (-a)    a
  //      ---------------
  //      (c-a)(!a-a) a
  //      ---------------
  //      b     z     a
  const substraction = create(this.number) as ISignedDigits;
  substraction.isNegative = false;
  let _left = left.clone();
  // Do the simple substraction
  let x = 0;
  for (x = right.lowerBound; x <= right.upperBound; x++) {
    let result = _left.get(x) - right.get(x);
    if (result < 0) {
      _left.update(x + 1, -1);
      result += this.base;
    }
    substraction.set(x, result);
  }
  substraction.upperBound = x - 1;
  // In case there the number created a negative substraction, resolve the carry
  // and mark as it
  if (_left.get(x) == -1) {
    substraction.upperBound = x;
    substraction.isNegative = true;
    const restore = new Array(x);
    for (let i = 0; i < x; i++) {
      restore[i] = 0;
    }
    restore[x] = 1;
    for (let i = 0; i < restore.length; i++) {
      let result = restore[i] - substraction.get(i);
      if (result < 0) {
        restore[i + 1]--;
        result += this.base;
      }
      substraction.set(i, result);
    }
  }
  // Remove all leading zeroes
  substraction.compact();
  // Return the resulted substraction
  return substraction;
}
