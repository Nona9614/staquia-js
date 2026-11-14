// Interfaces
import IDigits from "../../interfaces/digits.js";

export default function compact(this: IDigits): void {
  // Iterate from the upper bound to '0' to remove all leading zeroes
  let upperBound = this.upperBound;
  for (let n = this.upperBound; n >= this.lowerBound; n--) {
    if (this.isKeyZero(n)) {
      this._map.delete(n);
      upperBound -= 1;
    } else {
      break;
    }
  }
  // If while removing the upper bound reached '0' force the
  // object to behave as at least contains one simple '0' value
  if (upperBound < 0) {
    this.lowerBound = 0;
    upperBound = 0;
    this.set(0, 0);
  }
  // Updates to the new upper bound
  this.upperBound = upperBound;
}
