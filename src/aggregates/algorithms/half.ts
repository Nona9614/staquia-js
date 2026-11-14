// Number
import create from "../number/create.js";
// Interfaces
import IAlgorithms from "../../interfaces/algorithms.js";
import ICrafter from "../../interfaces/crafter.js";
import IDigits from "../../interfaces/digits.js";
import INumberSystem from "../../interfaces/number-system.js";

export default function half(
  this: INumberSystem & IAlgorithms & ICrafter,
  beforeCodes: IDigits,
  afterCodes: IDigits,
  round: boolean,
): IDigits {
  // Here is where al resolved codes from the main diverge algorith will be placed.
  // Also, system will be selfaware of how long is his set
  const valueCodes = create(this.number);
  valueCodes._map = new Map();
  valueCodes.lowerBound = -1;
  valueCodes.upperBound = beforeCodes.upperBound;

  // The 'middle point' between two numbers can be found like:
  // let middle = (|p1 - p2| / 2) + p1, thus symplyfing: middle = (p1 + p2) / 2
  // system will be the number that will be being pointed to get the 'average weight'
  // from the strings to be evaluated.

  // Will store the trailing value each time an overflow takes place
  let trailing = 0;
  // Will store the floating number value from the average
  let q: number;
  // Will store the floating number value from raw division
  let d: number;
  // Will store the remaining value from the average
  let m: number;
  // The base as a float value
  let base = this.base;

  // Iterate down to the extra indexes
  for (let i = valueCodes.upperBound; i >= valueCodes.lowerBound; i--) {
    // Gets the after and before code
    let previous_code = afterCodes.get(i);
    let next_code = beforeCodes.get(i);
    // Gets the '(p1 + p2) / 2' value (plus the trailing if exists)
    d = (previous_code + next_code) / 2;
    q = d + trailing;
    // Gets the remainder from the previous equation
    m = q - Math.floor(q);
    // Removes the remainder to the original value
    q -= m;
    // Gets the trail to be added to the following nth number (n-1)
    trailing = m * base;
    // Stores the result
    valueCodes.set(i, q);
  }

  // If the last index was not used will be removed
  const hasDecimals = !valueCodes.isKeyZero(-1);

  // Gets the substraction result from the two numbers
  const substraction = this.substract(afterCodes, beforeCodes);

  // If the substraction result is not at least bigger than 2 it means it cannot be rounded
  // as doing so will cause the number to look like the after code
  const isRoundable = !substraction.isNegative && !(substraction.upperBound === 0 && substraction.get(0) < 3);

  // If note has decimals remove the last code
  if (!hasDecimals) {
    valueCodes.remove(-1);
    valueCodes.lowerBound = 0;
  }

  // If the number it has enough space between the values, the round flag is passed
  // and has remianing values, it will round it upwards
  if (hasDecimals && round && isRoundable) {
    valueCodes.remove(-1);
    valueCodes.lowerBound = 0;
    valueCodes.update(0, 1);
  }

  // If any number is above its base it has an 'overflow' therfore, that extra values
  // can be pushed to the n+1 position, for system case we can be sure that any overflow is only
  // above 1 times the base as the average function cannot cause to go beyond that
  this.resolveOverflow(valueCodes);

  return valueCodes;
}
