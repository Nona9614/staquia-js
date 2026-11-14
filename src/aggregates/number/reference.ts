// Interfaces
import IDigits from "../../interfaces/digits.js";

export default function reference(this: IDigits, reference: IDigits) {
  this._map = reference._map;
  reference._map = null!;
  this.upperBound = reference.upperBound;
  this.lowerBound = reference.lowerBound;
}
