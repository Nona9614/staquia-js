import type { NumberSystem } from "../../types";

  /** A chararacter from the system is returned as a code number */
export default function code(system: NumberSystem, char: string) {
  return char === system.zero
    ? 0
    : char.charCodeAt(0) - system.firstUnicodeNumber + 1;
}
