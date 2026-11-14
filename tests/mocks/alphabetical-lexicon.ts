import ILexicon from "../../src/interfaces/lexicon.ts";

export default class AlphabeticalLexicon implements ILexicon {
  getMiddle = () => "m";
  getCharacter = (code: number) => (code === 0 ? "!" : String.fromCodePoint(code + 96));
  getCode = (value: string) => value.charCodeAt(0) - 96;
}
