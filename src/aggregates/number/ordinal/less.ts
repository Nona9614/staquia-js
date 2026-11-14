// Methods
import comparator from "./comparator.js";
// Interfaces
import IDigits from "../../../interfaces/digits.js";

export default function less(this: IDigits, other: IDigits): boolean {
  const ordering = comparator(this, other);
  return ordering === "less";
}
