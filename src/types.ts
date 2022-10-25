/**
 * The `CodeNumber` values are just a number representation from any based numeric system.
 * Each index represents the corresponding position in such and the value the number corresponding to that position.
 * @example
 * // The base 10 number 123 is equal to (1*10^2) + (2*10^1) + (3*10^0)
 * // meaning that, would be stored within the object like:
 * const n123_b10 = {
 *     0: 3,
 *     1: 2,
 *     2: 1,
 * }
*/
export type CodeNumber = { [key: number]: number }
