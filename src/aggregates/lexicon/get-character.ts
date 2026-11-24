import INumberSystem from "../../interfaces/number-system.js";
import IUnicodes from "../../interfaces/unicodes.js";

/** A code is returned as a character from the system */
export default function getCharacter(
  this: {
    zero: INumberSystem["zero"];
    firstUnicodeNumber: IUnicodes["firstUnicodeNumber"];
    set?: INumberSystem["set"];
  },
  code: number,
): string {
  // A set: the digit is the index of its character
  if (this.set !== undefined) return this.set[code] ?? "\uFFFD";
  return code === 0 ? this.zero : String.fromCharCode(code + this.firstUnicodeNumber - 1);
}
