import ILexicon from "../../interfaces/lexicon.js";
import INumberSystem from "../../interfaces/number-system.js";
import IUnicodes from "../../interfaces/unicodes.js";

/** A character from the system is returned as a code number */
export default function getCode(this: INumberSystem & IUnicodes & ILexicon, char: string): number {
  return char === this.zero ? 0 : char.charCodeAt(0) - this.firstUnicodeNumber + 1;
}
