import type { NumberSystem } from "../../types";

/** Removes all leading zeroes from the string */
export default function trim(system: NumberSystem, value: string) {
  let stillLeadingZeroes: boolean = true;
  for (let i = 0; i < value.length; i++) {
    const char = value[i];
    stillLeadingZeroes &&= char === system.zero;
    if (!stillLeadingZeroes) return value.substring(i, value.length);
  }
  return value;
}
