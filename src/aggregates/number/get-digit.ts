// Intefaces
import IDigits from "../../interfaces/digits.js";

export default function getDigit(this: IDigits, key: number) {
  return this._map.get(key) ?? 0;
}
