import { NumberSystem } from "../../types";

/** Checks if some strings are the zero character */
export default function isZero(system: NumberSystem, ...values: string[]) {
  return values.every((value) => value === system.zero);
}
