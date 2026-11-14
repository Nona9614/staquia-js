// Interfaces
import IDigits from "../../interfaces/digits.js";

export default function clone(constructor: new () => IDigits) {
  return function (this: IDigits): IDigits {
    const map: Map<number, number> = new Map();
    for (let i = this.lowerBound; i <= this.upperBound; i++) {
      map.set(i, this.get(i));
    }
    const number = new constructor();
    number._map = map;
    number.lowerBound = this.lowerBound;
    number.upperBound = this.upperBound;
    return number;
  };
}
