// Shared
import { type TestStatus } from "../shared/status.ts";
// Utils
import { capitalize } from "../utils.ts";
// Structures
import TestMethod from "./test-method.ts";

export default class TestGroup {
  #id: string;
  #specId: string;
  #name: string;
  #failures: number = 0;
  #successes: number = 0;
  #status: TestStatus = "stale";
  #tests: TestMethod[] = [];

  get specId(): string {
    return this.#specId;
  }

  get id(): string {
    return this.#id;
  }

  get failures(): number {
    return this.#failures;
  }

  get successes(): number {
    return this.#successes;
  }

  get status(): TestStatus {
    return this.#status;
  }

  get name(): string {
    return this.#name;
  }

  get total(): number {
    return this.#tests.length;
  }

  constructor(specId: string, name: string) {
    this.#specId = specId;
    if (name.startsWith("#")) throw Error(`The name of the group can't start with the '#' symbol. Received '${name}'`);
    if (name.includes("@")) throw Error(`The name of a group of test methods cannot contain the character '@'. Received '${name}'.`);
    this.#name = name;
    const id = name + "@" + specId;
    this.#id = id;
  }

  add(test: TestMethod) {
    this.#tests.push(test);
  }

  run() {
    this.#failures = 0;
    this.#successes = 0;
    for (const test of this.#tests) {
      test.run();
      switch (test.status) {
        case "failed":
          this.#failures++;
          break;
        default:
          this.#successes++;
          break;
      }
    }
    let status: TestStatus = this.#tests.length > 0 ? "success" : "stale";
    if (this.#successes !== this.total) status = "failed";
    this.#status = status;
  }

  toHtml() {
    let html: string = "";

    for (const test of this.#tests) {
      html += test.toHtml();
    }

    html = html ? `<ul>${html}</ul>` : "This group has no tests.";

    return `
      <li class="spec__group spec__status--${this.#status}">
        <details id="${this.id}" ontoggle="$ontoggle(this);">
          <summary class="spec__title">
            <span class="spec__name">${capitalize(this.#name)}</span>
            <span class="spec__message">(Tests ${this.#successes}/${this.total})</span>
          </summary>
          ${html}
        </details>
      </li>
    `;
  }
}
