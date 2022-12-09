import type { OverflowHandler, RequiredRecursive, StaquiaSettings, ThreseholdHandler } from "./types";

export const defaultSettings: RequiredRecursive<StaquiaSettings> = {
  zero: "!",
  first: "\u00B0",
  last: "\u04B1",
  ϰ: 0.15,
  segments: {
    /** `N` segment length */
    n: 5,
    /** `Z` segment length */
    z: 15,
  },
  onThreshold(trigger) {},
  onOverflow(trigger) {},
};
