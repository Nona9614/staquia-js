// Number
import create from "../number/create.js";
// Interfaces
import IAlgorithms from "../../interfaces/algorithms.js";
import ICrafter from "../../interfaces/crafter.js";
import IDigits from "../../interfaces/digits.js";
import INumberSystem from "../../interfaces/number-system.js";

/**
 * Because an odd base is being used, to get the mid position for any number
 * the equation q = (nf + n0) / 2, where:
 *   - n0 represents the start string converted from the nth base to the 10th base
 *   - n1 represents the end string converted from the nth base to the 10th base
 *
 * @param before In the evaluation of two strings `s1 < s2` must be `s1`
 * @param after In the evaluation of two strings `s1 < s2` must be `s2`
 * @returns q - ( q mod 2 ), should be used as the result.
 * @remarks When q mod 2 is different from 0 then the mid character
 * from the set of the nth base, should be placed at the end of the output.
 */
export default function between(this: INumberSystem & IAlgorithms & ICrafter, before: IDigits, after: IDigits, round: boolean) {
  // Builds the numbers
  let beforeCodes: IDigits = before.clone();
  let afterCodes: IDigits = after.clone();
  let repeated: IDigits = create(this.number);
  this.compactNumbers(beforeCodes, afterCodes, repeated, "between");

  // Makes the calculation to get the mid value
  let valueCodes = this.half(beforeCodes, afterCodes, round);
  // Stacks the repated values
  valueCodes.stack(repeated);
  // Returns the generated string
  return valueCodes;
}
