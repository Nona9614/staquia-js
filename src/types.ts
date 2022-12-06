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
/**
* By default `Staquia` has a generic optimized settings,
* to have settings that are meant to a specific project,
* refer to the online documentation.
* @link
*/
export type NumberSystem = {
 /** The unicode character that represents the zero value */
 zero: string;

 /** The unicode character that represents the first value in the set */
 first: string;

 /** The unicode character number that represents the first value in the set */
 firstUnicodeNumber: number;

 /** The unicode character that represents the last value in the set */
 last: string;

 /** The unicode character number that represents the last value in the set */
 lastUnicodeNumber: number;

 /** The unicode character that represents the middle value in the set */
 middle: string;

 /** The unicode character number that represents the middle value in the set */
 middleUnicodeNumber: number;

 /** The base of the number set */
 base: number;

 /**
  * Coeficient that helps to set a threshold to determine when a position string
  * is starting to get to long
  */
 ϰ: number;

 /** `N` segment length */
 ln: number;

 /** `Z` segment length */
 lz: number;

 /** Maximum length that a position can have */
 lmax: number;

 /**
  * Calculated from the `ϰ` coeficient,
  * is the length such that a position reaches this
  * the sytem will fire a warning message
  */
 lϰ: number;
}