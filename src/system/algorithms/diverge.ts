import is from "guardex";
import type { NumberSystem } from "../../types";

import utils from "../utils";
import criteria from "./criteria";
import precompute from "./precompute";


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
export default function diverge(system: NumberSystem, value1: string, value2: string) {

    /** The string to be considered as the `before` value */
    let beforeString: string = value1;
    /** The string to be considered as the `after` value */
    let afterString: string = value2;

    // Swap values when value 1 is bigger than value 2
    if (value1 > value2) {
        afterString = value1;
        beforeString = value2;
    }

    const {
        precomputed,
        afterCodes,
        beforeCodes,
        valueCodes,
    } = precompute(system, beforeString, afterString, true, (start, maxlength, beforeCodes, afterCodes, valueCodes) => {
        /** Precomputed value coming from similar characters */
        let precomputed: string = "";

        /** The `room` will be the difference between the code's numbers */
        const room = utils.room(system, beforeString[start], afterString[start]);
        // If the `room` is bigger than 1 there is enough codes to fit between the characters, then
        // is only necessary to find the average `weight` between these two
        if (is.bigger(room, 1)) {
            beforeCodes[0] = utils.code(system, beforeString[start]);
            afterCodes[0] = utils.code(system, afterString[start]);
            valueCodes.upperBound = 0;
        }
        // If the `room` is one or negative, start to create the codes map from that point and onwards
        else {

            /** Determines when the values from `after` and `before` are still equal */
            let isEqualChar: boolean = true;

            // Iterate from the last point and break the main for after finish
            for (let j = start; j < maxlength; j++) {
                // If the previous iteration still was true, compare the codes
                // to determine if it is the same case for the current iteration 
                isEqualChar &&= beforeString[j] === afterString[j];

                // If is the same character just place it in the final string and continue
                if (isEqualChar) precomputed += beforeString[j];
                // In case characters that are not equal are found the `room` between them will be checked,
                // so at system point we are assuming the `room` will be always different than zero
                else {
                    // Sets the upper index value of the map
                    valueCodes.upperBound = maxlength - (j + 1);

                    // Reduces before concat
                    for (let k = maxlength - 1; k >= j; k--) {
                        // Resolves the offset
                        let index = maxlength - (k + 1);
                        // Sets the values to zero if the string does not exist because the length is less than expected
                        // if not just store the code value
                        beforeCodes[index] = k <= beforeString.length - 1 ? utils.code(system, beforeString[k]) : 0;
                        afterCodes[index] = k <= afterString.length - 1 ? utils.code(system, afterString[k]) : 0;
                    }
        
                    // Breaks the 'Mapping Loop' as is no longer necessary
                    break;
                }
            }
        }
        return precomputed;
    });

    // Compacts the length of some string the most it can based on the criteria:
    // before string < middle string < after string
    let before: string = "";
    let after: string = "";
    let final: string = "";
    for (let i = valueCodes.upperBound; i >= valueCodes.lowerBound; i--) {
        before += utils.char(system, beforeCodes[i]);
        after += utils.char(system, afterCodes[i]);
        final += utils.char(system, valueCodes[i]);
        if (criteria(final, before, after)) break;
    }

    // Finally return the precomputed value plus the final value
    return precomputed + final;
}
