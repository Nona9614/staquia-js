import IDigits from "../../interfaces/digits.js";
import ILexicon from "../../interfaces/lexicon.js";

export default function reduce(this: { getCharacter: ILexicon["getCharacter"] }, number: IDigits): string {
  let string = "";
  for (let n = number.upperBound; n >= number.lowerBound; n--) {
    let digit = number.get(n);
    let ch = this.getCharacter(digit);
    string += ch;
  }
  return string;
}
