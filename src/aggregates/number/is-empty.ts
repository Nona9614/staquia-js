// Interfaces
import IDigits from "../../interfaces/digits.js";

export default function isEmpty(this: IDigits): boolean {
  return this._map.get(0) == undefined && this.upperBound == 0 && this.lowerBound == 0;
}
