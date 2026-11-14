// Intefaces
import IDigits from "../../interfaces/digits.js";

export default function stack(this: IDigits, other: IDigits): void {
  let upperBound = this.upperBound;
  for (let i = other.lowerBound; i <= other.upperBound; i++) {
    let value = other.get(i);
    upperBound += 1;
    this._map.set(upperBound, value);
  }
  this.upperBound = upperBound;
}
