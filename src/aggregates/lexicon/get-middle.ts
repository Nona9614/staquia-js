import INumberSystem from "../../interfaces/number-system.js";
import IUnicodes from "../../interfaces/unicodes.js";

export default function getMiddle(this: INumberSystem & IUnicodes): string {
  let lastCode = this.lastUnicodeNumber;
  let firstCode = this.firstUnicodeNumber;
  let a_plus_b = lastCode + firstCode - 1;
  let middlePoint = Math.ceil(a_plus_b / 2);

  // Middle point should be added the zero char
  return String.fromCodePoint(middlePoint);
}
