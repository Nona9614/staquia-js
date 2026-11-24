// Results
import result from "../../results/position-result.js";
import { Err } from "../../result.js";
// Errors
import InvalidCharacterError from "../../errors/invalid-character-error.js";
// Number
import create from "../number/create.js";
// Types
import type { IPositionResult } from "../../results/position-result.js";
// Interfaces
import IDigits from "../../interfaces/digits.js";
import ILexicon from "../../interfaces/lexicon.js";
import INumberSystem from "../../interfaces/number-system.js";
import ICrafter from "../../interfaces/crafter.js";
import IComposer from "../../interfaces/composer.js";
import IUnicodes from "../../interfaces/unicodes.js";

export default function forge(
  this: INumberSystem & IComposer & ILexicon & ICrafter & IUnicodes,
  string: string,
): IPositionResult {
  // Transforms the string as a vector of characters
  let length = string.length;

  // Every character must be a digit of the system: the zero or a character from first to last.
  // Validated before creating anything, so an invalid string does not allocate any number.
  const first = this.firstUnicodeNumber;
  const last = this.lastUnicodeNumber;
  const set = this.set;
  for (let i = 0; i < length; i++) {
    if (set !== undefined) {
      if (!set.includes(string[i]!)) return new Err(InvalidCharacterError.create(this, string, i));
      continue;
    }
    if (string[i] === this.zero) continue;
    const code = string.charCodeAt(i);
    if (code < first || code > last) return new Err(InvalidCharacterError.create(this, string, i));
  }

  let n: IDigits = create(this.number);
  n.upperBound = this.ln - 1;
  let z: IDigits = create(this.number);

  let ln = this.ln;
  if (length > ln) {
    for (let i = 0; i < ln; i++) {
      let ch = this.getCode(string[i]);
      n.set(ln - i - 1, ch);
    }
    const offset = length - ln;
    for (let i = 0; i < offset; i++) {
      let ch = this.getCode(string[ln + i]);
      z.set(offset - i - 1, ch);
    }
    z.upperBound = length - ln - 1;
  } else if (length == ln) {
    for (let i = 0; i < ln; i++) {
      let ch = this.getCode(string[i]);
      n.set(ln - i - 1, ch);
    }
    z.set(0, 0);
  } else {
    // `n` has a fixed size, the characters take the most significant digits
    // and the missing ones are filled with zeroes to the right
    const offset = ln - length;
    for (let i = 0; i < length; i++) {
      let ch = this.getCode(string[i]);
      n.set(ln - i - 1, ch);
    }
    for (let i = 0; i < offset; i++) {
      n.set(i, 0);
    }
    z.set(0, 0);
  }

  return result(this, { n, z, length });
}
