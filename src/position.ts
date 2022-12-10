import is from "guardex";

import type { NumberSystem, PositionObject, PositionValue } from "./types";

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
 * This objects represents a postion like `zzzzsssssssss` where:
 *  - N are the numbered position
 *  - Z is a special string generated when an insertion between
 *    two positions with no room
 */
export default class Position {
  /** Left number for after and before operations */
  #n: string = "";
  /** Right number for diverge and between operations */
  #z: string = "";
  /** Reference number sytem */
  #system: NumberSystem;
  /** Symbol used to check if it is a valid position */
  get symbol() {
    return symbol;
  }

  /** Determines if an object is a position instance */
  static isPosition = (value?: any): value is Position => isPosition(value);

  /** Determines if a plain object is a valid position object */
  static isPositionObject = (value?: any): value is PositionObject =>
    isPositionObject(value);

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
   */
  public next() {
    const n = after(this.#system, this.#n);
    return new Position(this.#system, n);
  }

  /**
   * Gets the relative next position from another position
   */
  public previous() {
    const n = before(this.#system, this.#n);
    return new Position(this.#system, n);
  }

  /**
   * Returns the value that lies between the current postion and another
   * @param relative The position that should go before or after thi current position
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
  public update(value: string | { n?: string; z?: string }) {
    if (is.string(value)) {
      this.#parse(value);
    } else if (Position.isPositionObject(value)) {
      this.#parse(value.n + (value.z ?? ""));
    } else throw new Error("Canont update position from an invalid value");
  }

  /**
   * Use as value of the string transformation
   */
  public valueOf() {
    return this.toString();
  }

  /**
   * Concatenates the `n` value with the `z`
   */
  public toString() {
    return utils.isZero(this.#system, this.#z) ? this.#n : this.#n + this.#z;
  }

  /**
   * Gets the `n`  and `z` values
   */
  public toObject() {
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
