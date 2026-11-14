// Interfaces
import IDigits from "../../interfaces/digits.js";

export default function pop(this: IDigits) {
  this._map.delete(this.upperBound);
  this.upperBound -= 1;
}
