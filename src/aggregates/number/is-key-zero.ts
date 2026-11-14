// Interfaces
import IDigits from "../../interfaces/digits.js";

export default function isKeyZero(this: IDigits, key: number): boolean {
  return this.get(key) == 0;
}
