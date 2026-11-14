// Methos
import comparator from "./comparator.js";
// Unions
import Ordering from "../../../unions/ordering.js";
// Interfaces
import IDigits from "../../../interfaces/digits.js";

export default function compare(this: IDigits, other: IDigits): Ordering {
  return comparator(this, other);
}
