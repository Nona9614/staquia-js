/** Unique identifier generator. */
export default class Uuid {
  #counter: number = 0;

  /** Returns the generated id. */
  increase() {
    return ++this.#counter;
  }
}
