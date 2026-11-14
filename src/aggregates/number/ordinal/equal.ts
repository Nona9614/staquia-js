// Methods
import comparator from "./comparator.js";
// Interfaces
import IDigits from "../../../interfaces/digits.js";

export default function equal(this: IDigits, other: IDigits): boolean {
  const ordering = comparator(this, other);
  return ordering === "equal";
}
