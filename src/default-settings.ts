import Position from "./position";
import type { StaquiaSettings } from "./types";
import type { RequiredRecursive } from "./types-internal";

/**
 * These are the default configuarations to be used with `staquia`
 * for the number system
 */
export const defaultSettings: RequiredRecursive<StaquiaSettings> = {
  /** Default `zero` value when none is set*/
  zero: "!",
  /** Default `first` value when none is set*/
  first: "\u00B0",
  /** Default `last` value when none is set*/
  last: "\u04B1",
  /** Default `ϰ` value when none is set*/
  ϰ: 0.15,
  /** Default segments lengths when none is set*/
  segments: {
    /** `N` segment length */
    n: 5,
    /** `Z` segment length */
    z: 15,
  },
  /** Default threshold handler when none is set is a `noop`*/
  onThreshold(trigger: Position) {},
  /** Default overflow handler when none is set is a `noop`*/
  onOverflow(trigger: Position) {},
};
