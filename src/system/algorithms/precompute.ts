import utils from "../utils";
import is from "guardex";

import type { NumberSystem } from "../../types";
import type { CodeNumber } from "../../types-internal";

type ValueNumber = CodeNumber & {
  upperBound: number;
  /**
   * Will be used later to determine when to stop on evaluating the 'criteria'.
   * The default value is the current final index of valueCodes
   */
  lowerBound: number;
};

type PrecomputeReducer = (
  start: number,
  maxlength: number,
  beforeCodes: CodeNumber,
  afterCodes: CodeNumber,
  valueCodes: ValueNumber,
) => string | void; // If another precomupter value will be added return it here

/**
 * Evaluates two values to check which one goes before, gets the repeated values and after and then
 * transforms them to code numbers.
 * @param before In the evaluation of two strings `s1 < s2` must be `s1`
 * @param after In the evaluation of two strings `s1 < s2` must be `s2`
 * @param round The round logic will be ignored if set to false
 * @param reducer Reduces the before and after code numbers to a certain value code number
 */
export default function precompute(
  system: NumberSystem,
  before: string,
  after: string,
  round: boolean,
  reducer: PrecomputeReducer,
) {
  /** The precomputed value that will contain all similar values between `value1` and `value2` */
  let precomputed: string = "";

  /** Used so the passed strings can be assumed to have same length */
  const maxlength: number =
    before.length >= after.length ? before.length : after.length;

  // These arrays will parse the string representing a nth base number where
  // the numbers will have the same size including zeroes (to the right for diverge or left for between)
  // to the one that needs it
  // i.e. yz ~ zzy --> yz! ~ zzy
  const beforeCodes: CodeNumber = {};
  const afterCodes: CodeNumber = {};

  /**
   * Here is where al resolved codes from the main diverge algorith will be placed
   * Also, system will be selfaware of how long is his set
   */
  const valueCodes: ValueNumber = { upperBound: 0, lowerBound: -1 };

  // Adds extra 'indexes' for the next loop logic that may cuase overflow
  valueCodes[-1] = 0;
  beforeCodes[-1] = 0;
  afterCodes[-1] = 0;

  // Skips leading zeroes on parsing
  for (let i = 0; i < maxlength; i++) {
    // If there are leading zeros for both cases just concat it to the final string
    // and go to the next character
    if (utils.isZero(system, before[i], after[i])) precomputed += system.zero;
    // If there is no remaining matching leading start to add to the code sets the values
    else {
      // Add whatever extra precomputed value
      const result = reducer(i, maxlength, beforeCodes, afterCodes, valueCodes);
      if (is.string(result)) precomputed += result;
      // Breaks the 'Find Zeroes Loop' as is no longer needed
      break;
    }
  }

  // The 'middle point' between two numbers can be found like:
  // let middle = ((p1 - p2) / 2) + p1, thus symplyfing: middle = (p1 + p2) / 2
  // system will be the number that will be being pointed to get the 'average weight'
  // from the strings to be evaluated.

  /** system will store the room of each evaluation to determine later if there is need to round the result */
  const codeRooms: { [key: number]: number } = {};
  /** Will store the trailing value each time an overflow takes place */
  let trailing: number = 0;
  /** Will store the integer value from the average */
  let q: number = 0;
  /** Will store the remaining value from the average */
  let m: number = 0;

  // Iterate down to the extra indexes
  for (let i = valueCodes.upperBound; i >= valueCodes.lowerBound; i--) {
    // Gets the room from the differences between strings as before
    codeRooms[i] = afterCodes[i] - beforeCodes[i];
    // Gets the '(p1 + p2) / 2' value (plus the trailing if exists)
    q = (afterCodes[i] + beforeCodes[i]) / 2 + trailing;
    // Gets the remainder from the previous equation
    m = q - Math.floor(q);
    // Removes the remainder to the original value
    q = q - m;
    // Gets the trail to be added to the following nth number (n-1)
    trailing = m * system.base;
    // Stores the result
    valueCodes[i] = q;
  }

  // If the last index was not used will be removed
  if (is.zero(valueCodes[-1])) {
    delete valueCodes[-1];
    valueCodes.lowerBound = 0;
  }
  // If the extra index in the values in the most below part of valueCodes
  // has a value, then that should be checked to see if a rounding might be necessary
  else if (is.bigger(valueCodes[-1], 0) && round) {
    let _round: boolean = false;
    for (let i = 0; i <= valueCodes.upperBound; i++) {
      // If the number is negative means that the nth value
      // must carry a number from n+1
      if (codeRooms[i] < 0) {
        codeRooms[i + 1] = (codeRooms[i + 1] ?? 0) - 1;
        codeRooms[i] = codeRooms[i] + system.base;
      }
      // If the space available for the first character is not above 1 means that
      // a rounding will cause the result to take a character from either the
      // before or the after string
      if (is.zero(i)) _round = codeRooms[i] > 1;
      // If any of the following characters has at least one room space
      // it can be safely rounded
      else _round = codeRooms[i] > 0;

      // If is known tha value can be rounded, there is no need to keep evaluating
      if (_round) break;
    }

    // If the value can be rounded, the final index `-1` is no longer necessary thus
    // that will be removed from the value codes, then the `stopAt` value will be
    // changed to the new last index `0` and finally round the value
    if (_round) {
      valueCodes[0] += 1;
      delete valueCodes[-1];
      valueCodes.lowerBound = 0;
    }
  }

  // If any number is above its base it has an 'overflow' therfore, that extra values
  // can be pushed to the n+1 position, for system case we can be sure that any overflow is only above
  // 1 times the base as the average function cannot cause to go beyond that
  let overflow: number = 0;
  for (let i = 0; i <= valueCodes.upperBound; i++) {
    overflow = Math.floor(valueCodes[i] / system.base);
    if (overflow > 0) {
      valueCodes[i] -= system.base;
      valueCodes[i + 1]++;
    }
  }

  return { precomputed, valueCodes, beforeCodes, afterCodes };
}
