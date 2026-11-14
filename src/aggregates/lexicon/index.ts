// Interfaces
import ILexicon from "../../interfaces/lexicon.js";
// Aggregates
import getMiddle from "./get-middle.js";
import getCharacter from "./get-character.js";
import getCode from "./get-code.js";

export { getMiddle, getCharacter, getCode };

const lexicon: ILexicon = {
  getCharacter,
  getCode,
  getMiddle,
};

export default lexicon;
