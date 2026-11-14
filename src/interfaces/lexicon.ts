/**
 * Internal: converts between the characters of a system and their digit values.
 */
export default interface ILexicon {
  /** Gets the middle digit of the system: `ceil((first + last - 1) / 2)`, the digit of `start()`. */
  getMiddle(): string;
  /**
   * Gets the character of a digit value.
   * @param code The digit value (`0` is the zero).
   */
  getCharacter(code: number): string;
  /**
   * Gets the digit value of a character.
   * @param value The character.
   */
  getCode(value: string): number;
}
