import { expect } from "chai";
import _ from "../create-callee";
import type { NumberSystem } from "../../src/types";
import type { TestAlgorithms, TestName } from "../types";

import {
  after,
  before,
  between,
  criteria,
  diverge,
} from "../../src/system/algorithms";

export default function createAlgorithmTest(
  key: TestAlgorithms,
  system: NumberSystem,
) {
  switch (key) {
    case "after":
      return _(key, function (item) {
        const _after = after(system, item.value);
        expect(_after).to.eql(item.expected);
      });
    case "before":
      return _(key, function (item) {
        const _before = before(system, item.value);
        expect(_before).to.eql(item.expected);
      });
    case "between":
      return _(key, function (item) {
        const _between = between(system, item.before, item.after, item.round);
        expect(_between).to.eql(item.expected);
      });
    case "diverge":
      return _(key, function (item) {
        const _diverge = diverge(system, item.before, item.after);
        expect(_diverge).to.eql(item.expected);
      });
    case "criteria":
      return _(key, function (item) {
        const _after = criteria(item.value, item.before, item.after);
        expect(_after).to.eql(item.expected);
      });
    default:
      throw new Error(`Check if an algorithm '${key}' test is missing`);
  }
}
