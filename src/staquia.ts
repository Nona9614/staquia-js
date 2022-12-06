import { merge } from "lodash";

import Position from './position';
import createNumberSystem from "./system";
import type { RequiredRecursive, StaquiaSettings, PositionValue, ThreseholdHandler, OverflowHandler, NumberSystem } from './types';

const defaultSettings: RequiredRecursive<StaquiaSettings> = {
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
}

/**
 * A class that helps to have a dynamic position algorith using number systems
 * @example All that is menioned here are the default values
 * 
 * // An odd base (like 27th [a-z]) shoud be used with a zero character
 * // smaller than any value of the set (like [!])
 * const zero = "!"
 * const first = "a"
 * const last = "z"
 * 
 * // Sizes for the position algorithm, like `n = 4` and `z = 12`
 * // to generate positions like nnnn-zzzz-zzzz-zzzz
 * const size = { n: 4, z = 12 }
 */
export class Staquia {

  /** Sytem used to forge positions */
  #system: NumberSystem;

  /** Callback to trigger when entering the threshold */
  #onThreshold: ThreseholdHandler

  /** Callback to trigger during an overflow */
  #onOverflow: OverflowHandler

  constructor(settings?: StaquiaSettings) {
    const _settings = settings ? merge(defaultSettings, settings) : defaultSettings;
    this.#system = createNumberSystem(_settings);
    this.#onThreshold = _settings.onThreshold;
    this.#onOverflow = _settings.onOverflow;
  }

  /** Forges a new position */
  forge(value?: PositionValue) {
    const position = new Position(this.#system, value);
    const length = [...position.toString()].length;
    if (this.#system.lmax >= length) {
      this.#onOverflow(position, new Error(`The generated position '${position}' caused an overflow`));
    }
    else if (this.#system.lϰ >= length) this.#onThreshold(position);
    return position;
  }

}

// Force to export the settings here for rollup to expose them
export default Staquia;
