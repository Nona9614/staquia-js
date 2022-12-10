import { merge } from "lodash";
import { defaultSettings } from "./default-settings";
import { handlers } from "./handlers";

import { Position } from "./position";
import schemas from "./schemas";
import createNumberSystem from "./system";
import type { StaquiaSettings, PositionValue, NumberSystem } from "./types";

export class Staquia {
  /** Sytem used to forge positions */
  #system: NumberSystem;

  constructor(settings?: StaquiaSettings) {
    const _settings = settings
      ? merge(defaultSettings, settings)
      : defaultSettings;
    const system = createNumberSystem(_settings);
    schemas.ln = system.ln;
    schemas.lz = system.lz;
    handlers.onThreshold = _settings.onThreshold;
    handlers.onOverflow = _settings.onOverflow;
    this.#system = system;
  }

  start() {
    let n = "";
    for (let i = 0; i < this.#system.ln; i++) {
      n += this.#system.middle;
    }
    return this.position(n);
  }

  position(value?: PositionValue) {
    const position = new Position(this.#system, value);
    return position;
  }

  get system() {
    return this.#system;
  }
}

/** Global staquia instance */
let _instance = new Staquia();

/**
 * @module
 * Staquia helps to have a dynamic lexicographical position algorithm.
 * You can read more information of how to use it
 * in the [staquia](https://nona9614.github.io/staquia-js/) documentation page
 */
export const staquia = {
  /**
   * Updates the staquia settings such as the number system values
   * or the `threshold` and `overflow` handlers
   * @param settings The settings object to configure `staquia`
   * @example
   * // An odd base (like 27th [a-z]) should be used with a zero character
   * // smaller than any value of the set (like [!])
   * const zero = "!";
   * const first = "a";
   * const last = "z";
   *
   * // Segments for the position algorithm, that defines the length from the system
   * const segments = { n: 4, z: 12 }
   *
   * // ϰ (kappa) Helps to set a threshold to fire events to handle possible overflows
   * const ϰ = 0.15;
   */
  setup(settings?: StaquiaSettings) {
    _instance = new Staquia(settings);
  },
  /**
   * Creates a recommended start position to depart,
   * to have the most possible position forges
   * before an overflow
   * @example
   * import { staquia } from "staquia";
   *
   * // For instance if the middle character in the system is 'n'
   * // and the 'n' segment length is 5, the recommended position
   * // would be "nnnnn"
   * const nnnnn = staquia.start();
   */
  start() {
    return _instance.start();
  },
  /**
   * Creates a new position based on the current number system
   * @param value The reference `string` or `object` to create a position
   * @example
   * import { staquia } from "staquia";
   *
   * // You can create the position just like this
   * const position = staquia.position("nnnnzzzz");
   *
   * // If you need it, you can get the object representation
   * const object = position.toObject();
   *
   * // Or the string representation from your position
   * const string = position.toString();
   *
   * // You can compare the instances with the less than '<',
   * // greater than '>' or equal '=' operators
   * staquia.position("a") < staquia.position("b")
   */
  position(value?: PositionValue) {
    return _instance.position(value);
  },
  /**
   * @readonly
   * This `readonly` object is from the internal number system
   * that uses staquia to generate the positions
   */
  get system() {
    return _instance.system;
  },
};
