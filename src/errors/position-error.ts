import IPosition from "../interfaces/position.js";

/**
 * Any error returned by the position functions: an `OverflowError`, a `ThresholdReachedError`,
 * a `SystemMismatchError` or an `InvalidCharacterError`. Use `instanceof` with the error classes
 * (or their `true` discriminator fields) to know which one it is.
 *
 * @example
 * import Staquia, { InvalidCharacterError, ThresholdReachedError } from "staquia";
 *
 * const system = Staquia.create("!", "a", "z", 5, 15, 0.15);
 *
 * const result = system.forge("abC");
 * if (!result.ok) {
 *   if (result.error instanceof InvalidCharacterError) console.log("Not a digit at", result.error.index);
 *   else if (result.error instanceof ThresholdReachedError) console.log("Valid, but rebalance soon");
 *   else console.log(result.error.message);
 * }
 */
export type IPositionError = Error &
  (
    | {
        /** The position that overflowed. */
        readonly position: IPosition;
        /** `true` if the generated position overflowed, `false` otherwise. */
        readonly isOverflow: boolean;
      }
    | {
        /** The position that reached the threshold. */
        readonly position: IPosition;
        /** `true` if the generated position reached the threshold, `false` otherwise. */
        readonly isDangerous: boolean;
      }
    | {
        /** The position created by another system. */
        readonly position: IPosition;
        /** `true` if the position was created by another number system, `false` otherwise. */
        readonly isMismatch: boolean;
      }
    | {
        /** The string that was forged. */
        readonly string: string;
        /** The index of the first invalid character. */
        readonly index: number;
        /** `true` if the string contains a character that is not a digit of the system, `false` otherwise. */
        readonly isInvalid: boolean;
      }
  );
