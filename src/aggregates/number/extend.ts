// Interfaces
import IDigits from "../../interfaces/digits.js";

export default function extend(this: IDigits, size: number): void {
  // Make this number as large as the new size
  let upperBound: number = this.upperBound;
  this.upperBound = size + upperBound;
  // Reorder already stored values
  let up: number;
  let code: number;
  for (let n = upperBound; n >= 0; n--) {
    up = n + size;
    code = this.get(n);
    this._map.set(up, code);
  }
  for (let n = 0; n < size; n++) {
    this._map.set(n, 0);
  }
}
