// Entities
import NumberSystem from "./number-system.js";
// Types
import { IPositionResult } from "../results/position-result.js";
// Interfaces
import IComplexSystem from "../interfaces/complex-system.js";
import ICrafter from "../interfaces/crafter.js";
import IDigits from "../interfaces/digits.js";
import IPosition from "../interfaces/position.js";
import IForger from "../interfaces/forger.js";
import IStaquiaOptions from "../interfaces/options.js";
import IOverflowVerifier from "../interfaces/overflow-verifier.js";
// Implementations
import Digits from "./digits.js";
import Position from "./position.js";

/**
 * A lexicographic number system that creates **positions**: short strings that keep the order of a list.
 * Sort the items by their position string and you get the order back; moving an item only changes its own position.
 *
 * Create one with `Staquia.create` (or `Staquia.default`), then use it to create positions, or give it to a
 * `LexicalList` to keep the positions of your objects in sync. Nothing is thrown: every function that can fail
 * returns a `Result`.
 *
 * @example
 * import Staquia from "staquia";
 *
 * const system = Staquia.create("!", "a", "z", 5, 15, 0.15);
 *
 * const start = system.start(); // "mmmmm!"
 * const next = system.next(start); // "mmmmn!", stacked after start
 * const core = system.core(start, next); // "mmmmmn", between both
 *
 * if (core.ok) console.log(core.value.toString()); // "mmmmmn"
 *
 * @remarks
 * Read the guide at the [Staquia](https://nona9614.github.io/staquia-js/) documentation page.
 */
export default class Staquia implements IForger, IOverflowVerifier {
  #system!: IComplexSystem;

  /**
   * Creates the default number system, ready for production: the zero `!`, the digits from
   * `\u00B0` (°) to `\u04B1` (ұ), a base `1027` system, with `ln = 5`, `lz = 15` and `fϰ = 0.15`.
   *
   * @example
   * import Staquia from "staquia";
   *
   * const system = Staquia.default();
   * // The same as
   * const same = Staquia.create("!", "\u00B0", "\u04B1", 5, 15, 0.15);
   *
   * const start = system.start();
   * if (start.ok) console.log(start.value.toString()); // "ʰʰʰʰʰ!"
   *
   * @returns The default `Staquia` system.
   *
   * @remarks
   * Try other settings for your project in the Setup App of the
   * [documentation](https://nona9614.github.io/staquia-js/#setup).
   */
  static default() {
    return Staquia.create("!", "\u00B0", "\u04B1", 5, 15, 0.15);
  }

  /**
   * Creates a number system. Its digits are the `zero` and every character from `first` to `last`,
   * so its base is `b = (last - first) + 2` (by their unicode values).
   *
   * Use characters of the Basic Multilingual Plane (up to `U+FFFF`), so JavaScript, UTF-8 and UTF-16
   * compare them in the same order. The characters must be `zero < first < last`.
   *
   * @param zero The character of the zero digit.
   * @param first The character of the first digit (`1`).
   * @param last The character of the last digit (`b - 1`).
   * @param ln The fixed length of the `N` section, used to stack items without making positions longer.
   * @param lz The max length of the `Z` section, used when items are moved between two others.
   * @param fϰ A factor from `0` to `1`: the threshold is reached at the length `lϰ = ceil((1 - fϰ) * (ln + lz))`.
   * @param options Replaces the classes used to create positions and numbers, see `IStaquiaOptions`.
   *
   * @example
   * import Staquia from "staquia";
   *
   * // The alphabet: "!" is 0, "a" is 1 and "z" is 26, a base 27 system
   * const alphabet = Staquia.create("!", "a", "z", 5, 15, 0.15);
   *
   * const start = alphabet.start();
   * if (start.ok) console.log(start.value.toString()); // "mmmmm!"
   *
   * @returns The `Staquia` system.
   */
  static create(zero: string, first: string, last: string, ln: number, lz: number, fϰ: number, options?: IStaquiaOptions) {
    const staquia = new Staquia();
    const crafter: ICrafter = { number: options?.number ?? Digits, position: options?.position ?? Position };
    staquia.#system = NumberSystem.create(crafter, zero, first, last, ln, lz, fϰ);
    return staquia;
  }

  /** {@inheritDoc IForger.from} */
  from(number: IDigits): IPositionResult {
    return this.#system.from(number);
  }

  /** {@inheritDoc IForger.forge} */
  forge(string: string): IPositionResult {
    return this.#system.forge(string);
  }

  /** {@inheritDoc IForger.start} */
  start(): IPositionResult {
    return this.#system.start();
  }

  /** {@inheritDoc IForger.core} */
  core(previous: IPosition | IPositionResult, next: IPosition | IPositionResult): IPositionResult {
    return this.#system.core(previous, next);
  }

  /** {@inheritDoc IForger.next} */
  next(reference: IPosition | IPositionResult): IPositionResult {
    return this.#system.next(reference);
  }

  /** {@inheritDoc IForger.previous} */
  previous(reference: IPosition | IPositionResult): IPositionResult {
    return this.#system.previous(reference);
  }

  /** {@inheritDoc IOverflowVerifier.hasOverflow} */
  hasOverflow(position: IPosition): boolean {
    const length = position.n.upperBound + position.z.upperBound + 2;
    return length > this.#system.lmax;
  }
  /** {@inheritDoc IOverflowVerifier.isThresholdReached} */
  isThresholdReached(position: IPosition): boolean {
    const length = position.n.upperBound + position.z.upperBound + 2;
    return length >= this.#system.lϰ;
  }
}
