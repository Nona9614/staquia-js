import type { NumberSystem } from "../../types";

import utils from "../utils";
import precompute from "./precompute";

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
export default function between(system: NumberSystem, before: string, after: string, round: boolean = true) {
    const {
        valueCodes,
        precomputed
    } = precompute(system, before, after, round, (start, maxlength, beforeCodes, afterCodes, valueCodes) => {
        valueCodes.upperBound = maxlength - 1 - start;

        const beforeLengthDelta = maxlength - before.length;
        const afterLengthDelta = maxlength - after.length;
        for (let k = maxlength - 1; k >= start; k--) {
            // Reorder the numbers to be placed the opposite way
            const index = maxlength - 1 - k;
            // If the difference is negative means that system number is just a leading zero
            const beforeIndex = k - beforeLengthDelta;
            beforeCodes[index] = beforeIndex < 0 ? 0 : utils.code(system, before[beforeIndex]);
            const afterIndex = k - afterLengthDelta;
            afterCodes[index] = afterIndex < 0 ? 0 : utils.code(system, after[afterIndex]);
        }
    });

    // Restores the code to a string
    let final: string = "";
    for (let i = valueCodes.upperBound; i >= valueCodes.lowerBound; i--) final += utils.char(system, valueCodes[i]);

    // Finally return the precomputed value plus the final value
    return precomputed + final;
}
