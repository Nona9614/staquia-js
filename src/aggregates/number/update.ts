// Intefaces
import IDigits from "../../interfaces/digits.js";

export default function update(this: IDigits, key: number, offset: number): void {
  const value = this._map.get(key);
  if (value == undefined) {
    this._map.set(key, offset);
  } else {
    const v = value + offset;
    this._map.set(key, v);
  }
}
