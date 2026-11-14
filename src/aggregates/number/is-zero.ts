// Interfaces
import IDigits from "../../interfaces/digits.js";

export default function isZero(this: IDigits): boolean {
  return this.upperBound == 0 && this.lowerBound == 0 && (this._map.get(0) == undefined || this._map.get(0) == 0);
}
