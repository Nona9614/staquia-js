import is from "guardex";
import utils from "../utils";

import type { NumberSystem } from "../../types";
import type { CodeNumber } from "../../types-internal";

/**
 * Returns the previous value of the given number
 * @param trim If set, removes all leading zeroes
 */
export default function before(
  system: NumberSystem,
  value: string,
  trim: boolean = false,
) {
  // Avoid immutability issues
  let string: string = value;

  // If trim is set, removes all leading zeroes
  if (trim) {
    // Clean the number for ease
    string = utils.trim(system, string);
    // No value was remaining after trim, adds a zero
    if (string === "") string = system.zero;
  }

  // Adds minus one to the first character of the number and adding extra upperbound
  const number: CodeNumber = {
    0: utils.code(system, string[string.length - 1]) - 1,
  };
  // Resolve overflow
  for (let n = 0; n < string.length; n++) {
    let index = string.length - (n + 1);

    // Transforms `string` to code number and adds the default value
    if (!is.number(number[n])) number[n] = utils.code(system, string[index]);

    // If the substraction results in a negative value, then a carry is needed
    if (number[n] < 0) {
      // As at system point the n+1 value will not contain a real value
      // It needs to be assigned (If string does not contain that length, just put a zero)
      const next = string[index - 1];
      number[n + 1] = utils.code(system, next ?? system.zero);

      // Now it can be carried the value from the n+1 value to the current nth
      number[n + 1]--;
      number[n] += system.base;
    }
  }

  // Convert back to a string
  let before: string = "";
  for (let i = string.length - 1; i >= 0; i--)
    before += utils.char(system, number[i]);
  return before;
}
