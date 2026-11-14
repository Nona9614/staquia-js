import { TestStatus } from "../shared/status.ts";
import { Specs } from "../shared/store.ts";
import { capitalize } from "../utils.ts";
import TestGroup from "./test-group.ts";

export type SpecType = "Integration Test" | "Unit Test";

export default class Spec {
  #id: string;
  #name: string;
  #failures: number = 0;
  #successes: number = 0;
  #status: TestStatus = "stale";
  #groups: TestGroup[] = [];
  #type: SpecType;

  get id() {
    return this.#id;
  }

  get failures(): number {
    return this.#failures;
  }

  get successes(): number {
    return this.#successes;
  }

  get name() {
    return this.#name;
  }

  get type() {
    return this.#type;
  }

  get total() {
    return this.#groups.reduce((s, g) => g.total + s, 0);
  }

  constructor(name: string, type: SpecType) {
    this.#id = `${name}#${type}`;
    this.#name = name;
    this.#type = type;
    Specs.add(this);
  }

  add(group: TestGroup) {
    const groups = this.#groups;
    for (let i = 0; i < groups.length; i++) {
      if (groups[i].id == group.id) throw Error(`Adding the same group (id: ${group.id}) twice to the spec (id: ${this.#id}).`);
    }
    groups.push(group);
  }

  run() {
    this.#failures = 0;
    this.#successes = 0;
    for (const group of this.#groups) {
      group.run();
      this.#failures += group.failures;
      this.#successes += group.successes;
    }
    let status: TestStatus = this.#groups.length > 0 ? "success" : "stale";
    if (this.#successes !== this.total) status = "failed";
    this.#status = status;
    return this;
  }

  toHtml(): string {
    let html: string = "";
    for (const group of this.#groups) {
      html += group.toHtml();
    }

    if (html) html = `<ul>${html}</ul>`;

    const type = this.#type === "Integration Test" ? "integration" : "unit";

    return `
  <li class="spec spec--${type} spec__status--${this.#status}">
    <details id="${this.id}" ontoggle="$ontoggle(this);">
      <summary class="spec__title">
        <span class="spec__name">${capitalize(this.#name)}&nbsp;</span>
        <span class="spec__message">(Tests ${this.#successes}/${this.total})</span>
        <span class="spec__type">[${this.#type}]</span>
      </summary>
    ${html}
    </details>
  </li>
  `;
  }
}
