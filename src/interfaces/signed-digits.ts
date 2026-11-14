import IDigits from "./digits.js";

/** Internal: a number with a sign, the result of a subtraction. */
export default interface ISignedDigits extends IDigits {
  /** Marks the number as negative */
  isNegative: boolean;
}
