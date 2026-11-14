// Interfaces
import IDigits from "../../interfaces/digits.js";

export default function expand(this: IDigits, size: number): void {
  let upperBound: number = this.upperBound;
  let _size: number = size + upperBound + 1;
  this.upperBound = upperBound + size;
  for (let i = upperBound + 1; i < _size; i++) {
    this._map.set(i, 0);
  }
}
