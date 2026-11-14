// Interfaces
import IDigits from "../../interfaces/digits.js";

export default function remove(this: IDigits, key: number) {
  return this._map.delete(key);
}
