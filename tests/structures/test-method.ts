import { mark, type TestStatus } from "../shared/status.ts";

const verbose = process.env.VERBOSE?.toString().toLowerCase() === "true";

export default class TestMethod {
  #target: () => void;
  #context: any;
  #group: string | undefined;
  #name: string;
  #message: string = "";
  #description: string;
  #status: TestStatus = "stale";

  /** Name of the function */
  get name(): string {
    return this.#name;
  }
  /** The group of this test if any. */
  get group(): string | undefined {
    return this.#group;
  }
  /** The description related to this method to be displayed */
  get description(): string {
    return this.#description;
  }

  /** The current status of the method if was run. */
  get status(): TestStatus {
    return this.#status;
  }

  constructor(target: () => void, context: any, name: string, description: string, group?: string) {
    this.#target = target;
    this.#context = context;
    this.#name = name;
    this.#description = description;
    this.#group = group;
  }

  /** Invokes this method with the passed context */
  run(): void {
    let message = this.#description;
    try {
      this.#target.call(this.#context);
      this.#status = "success";
    } catch (error) {
      if (verbose) console.error(error);
      this.#status = "failed";
      message = (error as Error).message;
    } finally {
      this.#message = ` - ${message}`;
    }
  }

  /** Returns a representation of this instance as HTML. */
  toHtml(): string {
    return `
  <li class="spec__test spec__status--${this.#status}">
    <div class="spec__title">
      <span class="spec__mark">${mark(this.#status)}</span>
      <span class="spec__name">${this.#name}</span>
      <span class="spec__message">${this.#message}</span>
    </div>
  </li>
  `;
  }
}
