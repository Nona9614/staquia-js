import { merge } from "lodash";
import { defaultSettings } from "./default-settings";
import { handlers } from "./handlers";

import Position from "./position";
import schemas from "./schemas";
import createNumberSystem from "./system";
import type { StaquiaSettings, PositionValue, NumberSystem } from "./types";

class Staquia {
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

  /** Forges a recommended start position */
  start() {
    let n = "";
    for (let i = 0; i < this.#system.ln; i++) {
      n += this.#system.middle;
    }
    return this.position(n);
  }

  /** Forges a new position */
  position(value?: PositionValue) {
    const position = new Position(this.#system, value);
    return position;
  }

  /** Returns a readonly system object */
  get system() {
    return this.#system;
  }
}

/** Global staquia instance */
let _instance = new Staquia();

/**
 * Staquia helps to have a dynamic lexicographical position algorithm.
 * You can read more information in the documentation at:
 * @link https://github.com/Nona9614/staquia-js
 */
export const staquia = {
  /**
   * Updates the staquia settings
   * @example
   * // An odd base (like 27th [a-z]) should be used with a zero character
   * // smaller than any value of the set (like [!])
   * const zero = "!"
   * const first = "a"
   * const last = "z"
   *
   * // Segments for the position algorithm, that defines the length from the system
   * const segments = { n: 4, z = 12 }
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
   * // For instance if the middle character in the system is "n"
   * // and the `n` segment length is `4`, the recommended position
   * // would be "nnnn"
   * const nnnn = staquia.start();
   */
  start() {
    return _instance.start();
  },
  /**
   * Creates a new position using the current staquia settings
   * to generate positions like
   * @example
   * // You can create the position just like this
   * const position = staquia.position("nnnnzzzz");
   *
   * // If you need it, you can get the object representation
   * position.toObject() == { n: "nnnn", z: "zzzz" }
   * // Or the string representation from your position
   * position.toString() == "nnnnzzzz"
   *
   * // You can compare the instances with the less than `<`,
   * // greater than `>` or equal `=` operators
   * staquia.position("a") < staquia.position("b") == true
   */
  position(value?: PositionValue) {
    return _instance.position(value);
  },
  /**
   * This `readonly` object is from the internal number system
   * that uses staquia to generate the positions
   */
  get system() {
    return _instance.system;
  },
};

// Exports staquia as default
export default staquia;
