import { TestStatus } from "../shared/status.ts";
import Spec from "./test-spec.ts";

export default class Specs {
  #specs: Spec[] = [];
  #status: TestStatus = "stale";
  #failures: number = 0;
  #successes: number = 0;
  #total: number = 0;

  add(spec: Spec) {
    const specs = this.#specs;
    for (let i = 0; i < specs.length; i++) {
      if (specs[i].id == spec.id) throw Error(`The spec (id: ${spec.id}) has been added twice.`);
    }
    specs.push(spec);
  }

  find(specId: string) {
    for (const spec of this.#specs) {
      if (spec.id === specId) return spec;
    }
  }

  run() {
    this.#failures = 0;
    this.#successes = 0;
    for (const spec of this.#specs) {
      spec.run();
      this.#failures += spec.failures;
      this.#successes += spec.successes;
    }
    this.#total = this.#successes + this.#failures;
    let status: TestStatus = this.#specs.length > 0 ? "success" : "stale";
    if (this.#successes !== this.#total) status = "failed";
    this.#status = status;
    return this;
  }

  toHtml() {
    let html: string = "";

    for (const spec of this.#specs) {
      html += spec.toHtml();
    }

    return html
      ? `
    <details id="staquia-test-suite" class="specs spec__status--${this.#status}" ontoggle="$ontoggle(this);">
      <summary class="spec__title">
        <span class="spec__name">Staquia Tests</span>
        <span class="spec__message">(Tests ${this.#successes}/${this.#total})</span>
      </summary>
      <ul>${html}</ul>
    </details>`
      : html;
  }
}
