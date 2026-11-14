// Interfaces
import IAlgorithms from "../../interfaces/algorithms.js";
import ICrafter from "../../interfaces/crafter.js";
import IDigits from "../../interfaces/digits.js";
import INumberSystem from "../../interfaces/number-system.js";
import create from "../number/create.js";

/**
 * system function will equalize the length of Value1 and Value2 adding the
 *  zero character to the left of the shorter string if needed, then will
 *  find the point where CharacterBefore <> CharacterAfter.
 * Upon the `room` between these:
 * - If the `room` > 1 will only find the value between them
 * - If `room` <= 1 will use and optimized version of the Between function
 *
 * @param value1 Must be any value such that `value1 < value2` or `value2 < value1`
 * @param value2 Must be any value such that `value1 < value2` or `value2 < value1`
 */
export default function diverge(this: INumberSystem & IAlgorithms & ICrafter, value1: IDigits, value2: IDigits): IDigits {
  // Builds the numbers found
  let beforeCodes: IDigits = value1.clone();
  let afterCodes: IDigits = value2.clone();
  let repeated: IDigits = create(this.number);
  this.compactNumbers(beforeCodes, afterCodes, repeated, "diverge");

  // Makes the calculation to get the mid value
  let valueCodes = this.half(beforeCodes, afterCodes, true);

  // Cleans the number
  const number = this.clean(valueCodes, beforeCodes, afterCodes);
  if (number) valueCodes = number;
  // Stacks the repated values
  valueCodes.stack(repeated);
  // Returns the generated string
  return valueCodes;
}
