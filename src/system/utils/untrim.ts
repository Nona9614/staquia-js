import type { NumberSystem } from "../../types";

/** Given an expected size, concats all missing leading zeroes */
export default function untrim(system: NumberSystem, string: string, size: number) {
  let s: string = string;
  if (string.length < size) {
    do {
      s = system.zero + s;
    } while (s.length < size);
  }
  return s;
}
