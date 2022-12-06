import Position from "./position";

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
export type CodeNumber = { [key: number]: number };

/**
 * Callback to warn the sytem when a position had
 * reached the length lϰ and is
 * about to cause an overflow
 */
export type ThreseholdHandler = (trigger: Position) => void;

/**
 * Callback to use when the sytem generated a position
 * that reached the max length and caused an overflow
 */
export type OverflowHandler = (trigger: Position, error: Error) => void;

/**
 * Setttings from the number system
 */
export type NumberSystemSettings = {
    /** The unicode character that represents the first value in the set */
    first?: string;
    /** The unicode character that represents the last value in the set */
    last?: string;
    /** The unicode character that represents the zero value */
    zero?: string;
    /**
     * Coeficient that helps to set a threshold to determine when a position string
     * is starting to get to long
     */
    ϰ?: number;
    /** Segments length from the position strings  */
    segments?: {
      /** `N` segment length */
      n?: number;
      /** `Z` segment length */
      z?: number;
    };
} 

/**
 * Settings and configurations for the number system and event handlers
 */
export type StaquiaSettings = NumberSystemSettings & {

  /** Callback to trigger when entering the threshold */
  onThreshold?: ThreseholdHandler;

  /** Callback to trigger during an overflow */
  onOverflow?: OverflowHandler;
};

/** Generic function */
type Func = (...args: any[]) => any;
/** Primitive values */
type Primitive = Func | symbol | string | number | bigint | boolean;

export type RequiredRecursive<T> = T extends Primitive
  ? Exclude<T, undefined>
  : {
      [P in keyof T]-?: RequiredRecursive<T[P]>;
    };

/** Object representation from a position */
export type PositionObject = { n: string; z?: string };

/** Possible value representation from a position */
export type PositionValue = string | PositionObject;

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