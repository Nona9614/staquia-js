import { expect } from "chai";
import _ from "../create-callee";
import type { NumberSystem } from "../../src/types";
import type { TestPosition } from "../types";

import Position from "../../src/position";

export default function createPositionTest(
  key: TestPosition,
  system: NumberSystem
) {
  switch (key) {
    case "core":
      return _(key, function (item) {
        const before = new Position(system, item.before);
        const after = new Position(system, item.after);
        const core = before.core(after);
        expect(core.toString()).to.equal(item.expected);
      });
    case "next":
      return _(key, function (item) {
        const position = new Position(system, item.value);
        expect(position.next().toString()).to.equal(item.expected);
      });
    case "previous":
      return _(key, function (item) {
        const position = new Position(system, item.value);
        expect(position.previous().toString()).to.equal(item.expected);
      });
    case "toObject":
      return _(key, function (item) {
        const position = new Position(system, item.value);
        expect(position.toObject()).to.eql(item.expected);
      });
    case "toString":
      return _(key, function (item) {
        const position = new Position(system, item.value);
        expect(position.toString()).to.eql(item.expected);
      });
    default:
      throw new Error(`Check if an postion '${key}' test is missing`);
  }
}
