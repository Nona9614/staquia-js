// Results
import result from "../../results/position-result.js";
// Number
import create from "../number/create.js";
// Types
import { IPositionResult } from "../../results/position-result.js";
// Interfaces
import IDigits from "../../interfaces/digits.js";
import INumberSystem from "../../interfaces/number-system.js";
import ICrafter from "../../interfaces/crafter.js";
import IComposer from "../../interfaces/composer.js";

export default function _from(this: INumberSystem & IComposer & ICrafter, number: IDigits): IPositionResult {
  let length = number.upperBound - number.lowerBound + 1;
  let ln = this.ln;
  let lz = this.lz;

  const n = create(this.number);
  n.upperBound = ln - 1;
  const z = create(this.number);

  if (length > ln) {
    const offset = number.upperBound - n.upperBound;
    for (let i = ln - 1; i >= 0; i--) {
      let code = number.get(i + offset);
      n.set(i, code);
    }
    const remaining = offset - number.lowerBound;
    const end = lz - remaining;
    let x = remaining - 1;
    let y = offset;
    z.upperBound = x;
    for (let i = lz - 1; i >= end; i--) {
      let code = number.get(--y);
      z.set(x--, code);
    }
  } else if (length == ln) {
    for (let i = number.upperBound; i >= number.lowerBound; i--) {
      let code = number.get(i);
      n.set(i, code);
    }
    z.set(0, 0);
  } else {
    const offset = ln - length;
    for (let i = ln - 1; i >= offset; i--) {
      let code = number.get(i - offset);
      n.set(i, code);
    }
    for (let i = offset - 1; i >= 0; i--) {
      n.set(i, 0);
    }
    z.set(0, 0);
  }

  return result(this, { n, z, length });
}
