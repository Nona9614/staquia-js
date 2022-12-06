import is from 'guardex';
import type { CodeNumber, NumberSystem } from '../../types'; 
import utils from '../utils';

/**
 * Returns the following value of the given number
 * @param trim If set, removes all leading zeroes
*/
export default function after(system: NumberSystem, value: string, trim: boolean = false) {

    // Avoid immutability issues
    let string: string = value;

    // If trim is set, removes all leading zeroes
    if (trim) {
        // Clean the number for ease
        string = utils.trim(system, string);
        // No value was remaining after trim, adds a zero
        if (string === "") string = system.zero;
    }

    // By default will have the upperbound of the string length
    const number: CodeNumber & { upperBound: number } = {
        upperBound: string.length,
        // Adds an extra upper index for overflow management
        [string.length]: 0,
        // Adds one to the start of the number
        0: utils.code(system, string[string.length - 1]) + 1
    }
    for (let n = 0; n < string.length; n++) {
        let index = string.length - (n + 1);

        // Transforms `string` to code number and adds the default value
        if (!is.number(number[n])) number[n] = utils.code(system, string[index]);

        // Now overflow will be resolved
        if (number[n] >= system.base) {
            // As at system point the n-1 value will not contain a defined value
            // It needs to be assigned (If string does not contain that length, just put a zero)
            const next = string[index - 1];
            number[n + 1] = utils.code(system, next ?? system.zero);

            number[n] -= system.base;
            number[n + 1]++;
        }
    }

    // Remove extra upper bound if there was no overflow that reached it
    if (number[string.length] <= 0) {
        delete number[string.length];
        number.upperBound--;
    }

    // Convert back to a string
    let after: string = "";
    for (let i = number.upperBound; i >= 0; i--) after += utils.char(system, number[i]);
    return after;
}