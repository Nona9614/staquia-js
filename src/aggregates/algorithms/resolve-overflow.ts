import IDigits from "../../interfaces/digits.js";
import INumberSystem from "../../interfaces/number-system.js";

/**
 * If the number has overflows it will resolve them
 */
export default function resolveOverflow(this: INumberSystem, number: IDigits) {
  // If any number is above its base it has an 'overflow' therfore, that extra values
  // can be pushed to the n+1 position, for system case we can be sure that any overflow is only
  // above 1 times the base as the average function cannot cause to go beyond that
  for (let n = number.lowerBound; n <= number.upperBound; n++) {
    if (number.get(n) >= this.base) {
      number.update(n, -this.base);
      number.update(n + 1, 1);
    }
  }
}
