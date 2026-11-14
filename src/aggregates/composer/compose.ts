// Number
import create from "../number/create.js";
// Interfaces
import ICrafter from "../../interfaces/crafter.js";
import IDigits from "../../interfaces/digits.js";
import ILexicon from "../../interfaces/lexicon.js";

export default function compose(this: ILexicon & ICrafter, string: string): IDigits {
  const number = create(this.number);
  number.upperBound = string.length;
  for (let n = 0; n < string.length; n++) {
    const ch = string[n];
    number.set(n, this.getCode(ch));
  }
  return number;
}
