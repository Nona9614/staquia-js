// Intefaces
import INumberSystem from "../interfaces/number-system.js";

/**
 * Returned (never thrown) by `forge` when the string has a character that is not a digit of the system:
 * neither the `zero` nor a character from `first` to `last`. Check positions coming from outside (an API,
 * a form) with `forge` before storing them.
 *
 * @example
 * import Staquia, { InvalidCharacterError } from "staquia";
 *
 * const system = Staquia.create("!", "a", "z", 5, 15, 0.15);
 *
 * const result = system.forge("abC");
 * if (!result.ok && result.error instanceof InvalidCharacterError) {
 *   console.log(result.error.index); // 2, the "C"
 * }
 *
 * @group Errors
 */
export default class InvalidCharacterError extends Error {
  #string: string;
  #index: number;

  /** Always `true`: identifies an `InvalidCharacterError` without `instanceof`. */
  get isInvalid(): true {
    return true;
  }

  /** The string that was forged. */
  get string() {
    return this.#string;
  }

  /** The index of the first invalid character in the string. */
  get index() {
    return this.#index;
  }

  constructor(message: string, string: string, index: number) {
    super(message);
    this.#string = string;
    this.#index = index;
  }

  /**
   * Creates the error for a string with an invalid character.
   *
   * @param system The system that forged the string.
   * @param string The string that was forged.
   * @param index The index of the first invalid character.
   */
  static create(system: INumberSystem, string: string, index: number) {
    const message =
      `The character '${string[index]}' at index ${index} of "${string}" is not a digit of the system ` +
      `(the zero '${system.zero}' or a character from '${system.first}' to '${system.last}').`;
    return new InvalidCharacterError(message, string, index);
  }
}
