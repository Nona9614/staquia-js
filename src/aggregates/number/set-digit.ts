// Intefaces
import IDigits from "../../interfaces/digits.js";

export default function setDigit(this: IDigits, key: number, value: number) {
  this._map.set(key, value);
}
