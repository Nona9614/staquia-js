import HalfMode from "../unions/half-mode.js";
import IDigits from "./digits.js";
import ISignedDigits from "./signed-digits.js";

/**
 * Internal: the arithmetic of the system numbers, used to create positions.
 */
export default interface IAlgorithms {
  /**
   * Resolves the following value of the given number.
   * @param value The input number
   * @param trim If set to `true` trims the input value before resolve
   * @returns The resolved next `number`
   */
  after(value: IDigits, trim: boolean): IDigits;
  /**
   * Resolves the previous value of the given number.
   * @param value The input number
   * @param trim If set to `true` trims the input value before resolve
   * @returns The resolved previous `number`
   */
  before(value: IDigits, trim: boolean): IDigits;
  /**
   * Gets the mid position for any number with the equation q = (nf + n0) / 2, where:
   * - `n0` represents the start string converted from the nth base to the 10th base
   * - `n1` represents the end string converted from the nth base to the 10th base
   * @param before In the evaluation of two strings `n1 &lt; n2` must be `n1`
   * @param after In the evaluation of two strings `n1 &lt; n2` must be `n2`
   * @param round Rounds the result to the nearest upper integer if set to `true`
   * @returns The value q - ( q mod 2 )
   * When q mod 2 is different from 0 then the mid character
   * from the set of the nth base, should be placed at the end of the output.
   */
  between(before: IDigits, after: IDigits, round: boolean): IDigits;
  /**
   * This system function will equalize the length of `value1` and `value2`
   * adding zeroes to the right of the shorter number if needed, then will
   * find the point where `CharacterBefore &lt;&gt; CharacterAfter`.
   * Upon the `room` between these:
   * - If the `room` &gt; 1 will only find the value between them
   * - If `room` &lt;= 1 will use and optimized version of the Between function
   * <br>
   * #### Params
   * @param value1 Must be any value such that `value1 &lt; value2` or `value2 &lt; value1`
   * @param value2 Must be any value such that `value1 &lt; value2` or `value2 &lt; value1`
   * @returns The `string` that represents the diverged value
   */
  diverge(value1: IDigits, value2: IDigits): IDigits;
  /**
   * Ignores the zero values from the left until a `number` is found,
   * then pass any repeated values to the `repeated` number
   * and finally stores the different values as `code`
   * @param number1 The first `Number` generated
   * @param number2 The second `Number` generated
   * @param repeated The recovered repeated values
   * @param mode How the shorter number is padded with zeroes, see `HalfMode`
   * Both of the numbers will contain a `Number.LowerBound` value of -1 with
   * a value of `0`.
   */
  compactNumbers(number1: IDigits, number2: IDigits, repeated: IDigits, mode: HalfMode): void;
  /**
   * Evaluates two values to check which one goes before, gets the repeated values and
   * after and then transforms them to code.
   * @param beforeCodes The before codes
   * @param afterCodes The after codes
   * @param round Defines if the value should be rounded upwards
   */
  half(beforeCodes: IDigits, afterCodes: IDigits, round: boolean): IDigits;
  /**
   * Checks that a value is between two numbers such that: `before` < `value` < `after`
   * @param value - The value that will be checked to be beween the `numbers`
   * @param before - The lower bound `number`
   * @param after - The upper bound `number`
   * @returns the cleaned number
   */
  clean(value: IDigits, before: IDigits, after: IDigits): IDigits;
  /**
   * If the number has overflows it will resolve them
   */
  resolveOverflow(number: IDigits): void;
  /**
   * It will subtract two numbers and return the result and if it is negative.
   * @param left The left side of the subtraction
   * @param right The right side of the subtraction
   * @returns A number containing the subtraction information.
   */
  substract(left: IDigits, right: IDigits): ISignedDigits;
}
