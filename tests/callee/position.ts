import { expect } from "chai";
import _ from "../create-callee";
import type { NumberSystem } from "../../src/types";
import type { TestPosition } from "../types";

import Position from "../../src/position";

export default function createPositionTest(
  key: TestPosition,
  system: NumberSystem,
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
        const next = position.next();
        const string = next.toString();
        expect(string).to.equal(item.expected);
      });
    case "previous":
      return _(key, function (item) {
        const position = new Position(system, item.value);
        expect(position.previous().toString()).to.equal(item.expected);
      });
    case "toObject":
      return _(key, function (item) {
        const position = new Position(system, item.value);
        const { symbol, ..._ } = position.toObject();
        expect(_).to.eql(item.expected);
      });
    case "toString":
      return _(key, function (item) {
        const position = new Position(system, item.value);
        expect(position.toString()).to.eql(item.expected);
      });
    case "toEquals":
      return _(key, function (item) {
        const position = new Position(system, item.value);
        const eq = new Position(system, item.equals);
        const string = item.value.n + item.value.z;
        const result =
          position.toEquals(item.equals) &&
          position.toEquals(string) &&
          position.toEquals(eq);

        expect(result).to.equal(item.expected);
      });
    case "update":
      return _(key, function (item) {
        const position = new Position(system, item.original);
        position.update(item.update);
        expect(position.toString()).to.equal(item.expected);
      });
    case "valueOf":
      return _(key, function (item) {
        const before = new Position(system, item.before);
        const after = new Position(system, item.after);
        if (item.greater) {
          expect(after > before).to.equal(item.expected);
        } else {
          expect(after < before).to.equal(item.expected);
        }
      });
    default:
      throw new Error(`Check if the postion '${key}' test is missing`);
  }
}
