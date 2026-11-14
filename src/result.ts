/**
 * The outcome of an operation that can fail: a success with a `value`, or a failure with an `error`.
 *
 * The library never throws: every function that can fail returns a `Result`. Check `ok` first,
 * then TypeScript lets you read `value` or `error`.
 *
 * @template T - The type of the successful value.
 * @template E - The type of the error.
 *
 * @example
 * import Staquia, { OverflowError } from "staquia";
 *
 * const system = Staquia.create("!", "a", "z", 5, 15, 0.15);
 *
 * const result = system.next(system.forge("zzzzz"));
 * if (result.ok) {
 *   console.log(result.value.toString()); // the position
 * } else if (result.error instanceof OverflowError) {
 *   console.log(result.error.message); // explains that "zzzzz" is already the last value of N
 * }
 */
export type Result<T, E> =
  | {
      readonly ok: true;
      readonly value: T;
    }
  | {
      readonly ok: false;
      readonly error: E;
    };

/**
 * A successful `Result`, with its `value`.
 *
 * @template T - The type of the value.
 *
 * @example
 * import { Ok } from "staquia";
 *
 * const result = new Ok(5);
 * console.log(result.ok, result.value); // true 5
 */
export class Ok<T> {
  #value: T;

  /** Indicates that the result is successful. */
  get ok(): true {
    return true;
  }

  /** The successful value contained within this result. */
  get value() {
    return this.#value;
  }

  /**
   * Creates an instance of an Ok result.
   *
   * @param value - The value to wrap, optional if `T` permits `void`/`undefined`.
   */
  constructor(value?: T) {
    this.#value = value!;
  }

  /**
   * Returns a string representation of the contained value.
   */
  toString() {
    return this.#value!.toString();
  }
}

/**
 * A failed `Result`, with its `error`.
 *
 * @template E - The type of the error.
 *
 * @example
 * import { Err } from "staquia";
 *
 * const result = new Err(new Error("Something failed"));
 * console.log(result.ok, result.error.message); // false "Something failed"
 */
export class Err<E> {
  #error: E;

  /** Indicates that the result represents a failure. */
  get ok(): false {
    return false;
  }

  /** The error object or payload contained within this result. */
  get error() {
    return this.#error;
  }

  /**
   * Creates an instance of an Err result.
   *
   * @param error - The error payload to wrap.
   */
  constructor(error: E) {
    this.#error = error;
  }

  /**
   * Returns a string representation of the contained error.
   */
  toString() {
    return this.#error!.toString();
  }
}
