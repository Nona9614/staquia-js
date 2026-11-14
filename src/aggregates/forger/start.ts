// Types
import type { IPositionResult } from "../../results/position-result.js";
// Interfaces
import IForger from "../../interfaces/forger.js";
import ILexicon from "../../interfaces/lexicon.js";
import INumberSystem from "../../interfaces/number-system.js";

export default function start(this: INumberSystem & IForger & ILexicon): IPositionResult {
  let middle = this.getMiddle();
  let string = "";
  for (let i = 0; i < this.ln; i++) {
    string += middle;
  }
  return this.forge(string);
}
