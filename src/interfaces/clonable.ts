/**
 * An object that can create a copy of itself.
 *
 * @template T The type of the copy.
 */
export default interface IClonable<T> {
  /**
   * Creates a copy of this object in a new instance.
   */
  clone(): T;
}
