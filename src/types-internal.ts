/** Generic function */
export type Func = (...args: any[]) => any;
/** Primitive values */
export type Primitive = Func | symbol | string | number | bigint | boolean;

/** Marks all fields from an object as required */
export type RequiredRecursive<T> = T extends Primitive
  ? Exclude<T, undefined>
  : {
      [P in keyof T]-?: RequiredRecursive<T[P]>;
    };

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
export interface CodeNumber {
  [key: number]: number;
}
