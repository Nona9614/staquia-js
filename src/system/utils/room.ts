import is from "guardex"
import type { NumberSystem } from "../../types";

import code from "./code";

/**
   * Gets the room between two characters
   * @returns The difference between the characters, but if any of them is not an string will return null
   */
export default function room(
  system: NumberSystem,
  before: string,
  after: string
) {
  return is.string(before) && is.string(after)
    ? code(system, after) - code(system, before)
    : null;
}
