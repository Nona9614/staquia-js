import is from "guardex";

import type {
  NumberSystem,
  PositionSegments,
  PositionObject,
  PositionValue,
} from "./types";

// Utils
import utils from "./system/utils";

// Algorithms
import between from "./system/algorithms/between";
import diverge from "./system/algorithms/diverge";
import after from "./system/algorithms/after";
import before from "./system/algorithms/before";
import { handlers } from "./handlers";
import { isPosition, isPositionObject } from "./schemas";
import { symbol } from "./symbol";

/**
 * This objects represents a postion instace that can be divided in:
 *  - `n` as the part that helps the position to move up and down
 *  - `z` as the part that helps to expand on reinsertions
 *
 * Each instance contains functions that helps to get the
 * next, previous or even between positions values.
 * Plus validation and comparation logic.
 *
 * By default this position will be generated using the
 * defined `staquia` number sytem as reference.
 *
 * @example
 * import { staquia } from "staquia";
 *
 * // Create an instance directly from the global staquia instance,
 * const position = staquia.position();
 *
 *
 */
export default class Position {
  /** Left number for after and before operations */
  #n: string = "";
  /** Right number for diverge and between operations */
  #z: string = "";
  /** Reference number sytem */
  #system: NumberSystem;
  /**
   * @readonly
   * Unique symbol attached to every position instance, helps to validate that
   * an object is a `pure` position and it was not instanciated with another
   * seemingly class or prototype
   */
  get symbol() {
    return symbol;
  }

  /** Determines if an object is a position instance */
  static isPosition(value?: any): value is Position {
    return isPosition(value);
  }

  /** Determines if a plain object is a valid position object */
  static isPositionObject(value?: any): value is PositionSegments {
    return isPositionObject(value);
  }

  /**
   * @param system The number system to use for the position functions
   * @param value Used to set a default value for the position
   */
  constructor(system: NumberSystem, value?: PositionValue) {
    this.#system = system;

    if (is.string(value)) {
      // Parses the default value and assing it
      this.#parse(value);
    } else if (is.object(value)) {
      // Starts the default value from an object
      let string: string = value.n;
      if (is.string(value.z)) string += value.z;
      this.#parse(string);
    } else {
      // Starts the n with only zeroes
      for (let i = 0; i < system.ln; i++) this.#n += system.zero;
      this.#z = system.zero;
    }

    const string = this.toString();
    const length = [...string].length;
    if (length >= this.#system.lmax) {
      handlers.onOverflow(
        this,
        new Error(`The generated position '${string}' caused an overflow`),
      );
    } else if (length >= this.#system.lϰ) handlers.onThreshold(this);
  }

  /**
   * Gets the relative next position from another position
   * @example
   * // The character "a" is followed by "b" in the unicode standard
   * const nnnb = staquia.position("nnna").next();
   */
  public next() {
    const n = after(this.#system, this.#n);
    return new Position(this.#system, n);
  }

  /**
   * Gets the relative next position from another position
   * @example
   * // The character "b" is followed by "a" in the unicode standard
   * const nnna = staquia.position("nnnb").next();
   */
  public previous() {
    const n = before(this.#system, this.#n);
    return new Position(this.#system, n);
  }

  /**
   * Returns the value that lies between the current postion and another
   * @param relative The position that should go before or after thi current position
   * @example
   * import { staquia } from "staquia";
   *
   * // Given a system like this
   * let zero = "!"; // Would be like 0
   * let first = "a"; // Would be like 1
   * let middle = "n"; // Would be like 14
   * let last = "z"; // Would be like 26
   *
   * // The middle character between two positions
   * // can be seen as Math.ceil((first + last) / 2);
   * let n = staquia.position(first).core(last); // Will result in "n"
   *
   * // When there is no room between 2 positions, the "middle" value
   * // from the system will be attached to the last position.
   * // This is where the "threshold" and "overflow" handling
   * // logic will be applied
   * let am = staquia.position("a").core("b"); // Will result in "am"
   */
  public core(relative: Position | PositionValue) {
    let previous: Position = this;
    let next: Position = Position.isPosition(relative)
      ? relative
      : new Position(this.#system, relative);

    // Set the proper weight
    if (previous > next) {
      const temp = previous;
      next = previous;
      previous = temp;
    }

    // If there is not enough room (above 1) use diverge,
    // if not use between
    const final: string =
      previous.#n === next.#n || previous.next().#n === next.#n
        ? diverge(this.#system, previous.toString(), next.toString())
        : between(this.#system, previous.#n, next.#n);

    return new Position(this.#system, final);
  }

  /**
   * Transforms a string to a `position` object
   * @param string Is the value to be parsed
   */
  #parse(string: string) {
    this.#n = string.substring(0, this.#system.ln);
    if (string.length > this.#system.ln) {
      this.#z = string.substring(this.#system.ln);
    } else {
      this.#n = utils.untrim(this.#system, this.#n, this.#system.ln);
      this.#z = this.#system.zero;
    }
  }

  /**
   * Updates the position based on an input value
   */
  public update(value: string | Partial<PositionSegments>) {
    if (is.string(value)) {
      this.#parse(value);
    } else if (Position.isPositionObject(value)) {
      this.#parse(value.n + (value.z ?? ""));
    } else
      throw new Error(
        `Canont update position from an invalid value ${JSON.stringify(value)}`,
      );
  }

  /**
   * With this function the position instances can be compared
   * as plain `strings` with the less than `<` and greater than `>`
   * operators
   * @example
   *
   * // Create your positions
   * const a = staquia.position("a");
   * const b = staquia.position("b");
   *
   * // Just compare them as plain objects
   * a < b // Will return false
   * a > b // Will return true
   */
  public valueOf() {
    return this.toString();
  }

  /**
   * Concatenates the `n` value with the `z`
   * @example
   *
   * // Asuming the "n" segment length is like below
   * let ln = 5;
   *
   * // Create it as an object
   * const position = staquia.position({
   *  n: "n",
   *  z: "zzzz",
   * });
   *
   * // Will print "!!!!nzzzz" as will attach leading zeroes
   * const string = position.toString();
   */
  public toString() {
    return utils.isZero(this.#system, this.#z) ? this.#n : this.#n + this.#z;
  }

  /**
   * Gets the `n`  and `z` values
   * @example
   * // Asuming the "n" segment length is like below
   * let ln = 5;
   *
   * // Create it as a string
   * const position = staquia.position("n");
   * postion.toObject
   *
   * // Will look like this
   * let object = {
   *  n: "!!!!n",
   *  z: "!"
   * }
   */
  public toObject(): PositionObject {
    return {
      n: this.#n,
      z: this.#z,
      get symbol() {
        return symbol;
      },
    };
  }

  /**
   * Compares an object or a string to see if it is equals to the current instance
   * @param value The value to compare against
   * @example
   *
   * const original = staquia.position("nnnnnz");
   *
   * // Can be compared with another instance
   * const instance = staquia.position("nnnnnz");
   * original.toEquals(instance);
   *
   * // Can be compared with a valid position string
   * const string = "nnnnnz";
   * original.toEquals(string);
   *
   * // Can be compared with a valid position object
   * const object = { n: "nnnnn", z: "z"};
   * original.toEquals(object);
   *
   */
  toEquals(value: Position | PositionValue) {
    if (is.string(value)) {
      return this.toString() === value;
    } else if (Position.isPosition(value)) {
      return this.toString() === value.toString();
    } else if (Position.isPositionObject(value)) {
      return this.#n === value.n && this.#z === value.z;
    } else {
      return false;
    }
  }
}

export { Position };
