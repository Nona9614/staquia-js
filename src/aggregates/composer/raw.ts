// Number
import create from "../number/create.js";
// Interfaces
import INumberSystem from "../../interfaces/number-system.js";
import ICrafter from "../../interfaces/crafter.js";
import IDigits from "../../interfaces/digits.js";
import IPosition from "../../interfaces/position.js";

export default function raw(this: ICrafter & INumberSystem, position: IPosition, upperBound: number): IDigits {
  const number = create(this.number);
  const __upperBound = position.n.upperBound + position.z.upperBound + 1;
  const _upperBound = upperBound < __upperBound ? __upperBound : upperBound;
  number.upperBound = _upperBound;
  let offset = upperBound - __upperBound;
  for (let n = position.z.lowerBound; n <= position.z.upperBound; n++) {
    number.set(n + offset, position.z.get(n));
  }
  offset += position.z.upperBound + 1;
  for (let n = position.n.lowerBound; n <= position.n.upperBound; n++) {
    number.set(n + offset, position.n.get(n));
  }
  offset = upperBound - __upperBound;
  for (let n = 0; n < offset; n++) {
    number.set(n, 0);
  }
  return number;
}
