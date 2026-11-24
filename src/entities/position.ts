// Interfaces
import IPosition from "../interfaces/position.js";
import IDigits from "../interfaces/digits.js";
import Ordering from "../unions/ordering.js";

/**
 * The default class of the positions: data plus the comparison functions.
 *
 * You never create positions with `new`: a `Staquia` system creates them (`forge`, `start`, `next`, `previous`, `core`)
 * as instances of its own subclass of this class (or of the class passed in its options), so
 * `position instanceof Position` is `true`. Extend it to add your own methods to every position, see `IStaquiaOptions`.
 *
 * @example
 * import Staquia, { Position } from "staquia";
 *
 * const system = Staquia.create("!", "a", "z", 5, 15, 0.15);
 *
 * const start = system.start();
 * if (start.ok) {
 *   console.log(start.value instanceof Position); // true
 *   console.log(start.value.toString()); // "mmmmm!"
 * }
 */
export default class Position implements IPosition {
  /** The digits of the `N` section. */
  n!: IDigits;
  /** The digits of the `Z` section. */
  z!: IDigits;
  /**
   * The length measured when the position was created (`N` plus `Z`), the one the threshold and the max
   * length are compared with. It doesn't count the zeroes that complete the string: `"mmmmm!"` created by
   * `start` has `5`, `"ab!!!!"` forged from `"ab"` has `2`.
   */
  length!: number;

  digits(): IDigits {
    // `n` is the integer part and `z` the fractional part, so `z` must be aligned
    // by its most significant digit right below `n` (negative indexes). Otherwise a
    // longer `z` would shift `n` upwards and be wrongly considered a bigger number.
    const copy = this.n.clone();
    const shift = this.z.upperBound + 1;
    for (let i = this.z.lowerBound; i <= this.z.upperBound; i++) {
      copy._map.set(i - shift, this.z.get(i));
    }
    copy.lowerBound = this.z.lowerBound - shift;
    return copy;
  }

  equal(other: IPosition): boolean {
    const left = this.digits();
    const right = other.digits();
    return left.equal(right);
  }

  compare(other: IPosition): Ordering {
    const left = this.digits();
    const right = other.digits();
    return left.compare(right);
  }

  greater(other: IPosition): boolean {
    const left = this.digits();
    const right = other.digits();
    return left.greater(right);
  }

  greaterOrEqual(other: IPosition): boolean {
    const left = this.digits();
    const right = other.digits();
    return left.greaterOrEqual(right);
  }

  less(other: IPosition): boolean {
    const left = this.digits();
    const right = other.digits();
    return left.less(right);
  }

  lessOrEqual(other: IPosition): boolean {
    const left = this.digits();
    const right = other.digits();
    return left.lessOrEqual(right);
  }
}

/**
 * Hidden property of a system position class that identifies the meaning of its digits.
 * Systems with the same signature generate compatible positions.
 */
export const SIGNATURE: unique symbol = Symbol("Staquia position signature");

/**
 * Creates the position class of a single number system.
 *
 * Every system needs its own class because the string representation of a position depends
 * on the characters of the system that created it. Sharing a class (and its prototype)
 * would make the last created system overwrite how every other position is printed.
 *
 * The positions still contain only data (`n`, `z` and `length`), the system characters live
 * on the class prototype, so positions keep no reference to the system.
 *
 * @param base The position class to extend, `Position` or a custom one. It is never modified.
 * @param toString The function that builds the string representation of the system positions.
 * @param signature Identifies the meaning of the system digits, see {@link SIGNATURE}.
 * @returns A subclass of `base` owned by the system.
 */
export function derive(
  base: new () => IPosition,
  toString: (this: IPosition) => string,
  signature: string,
): new () => IPosition {
  const SystemPosition = class extends base {};
  // Keeps the base name for debugging, positions are still shown as their base class
  Object.defineProperty(SystemPosition, "name", { value: base.name });
  // Non-enumerable like the native `toString`, so it never appears when spreading or serializing
  Object.defineProperty(SystemPosition.prototype, "toString", { value: toString, writable: true, configurable: true });
  Object.defineProperty(SystemPosition.prototype, SIGNATURE, { value: signature });
  return SystemPosition;
}
