import type { NumberSystem } from "../../types";

/** A code is returned as a character from the system */
export default function char(system: NumberSystem, code: number) {
  return code === 0
    ? system.zero
    : String.fromCharCode(code + system.firstUnicodeNumber - 1);
}