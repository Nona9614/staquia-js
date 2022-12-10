import { expect } from "chai";
import _ from "../create-callee";
import type {
  NumberSystem,
  OverflowHandler,
  ThreseholdHandler,
} from "../../src/types";
import type { TestSchemas } from "../types";

import Position from "../../src/position";
import { handlers } from "../../src/handlers";
import schemas, { isPosition, isPositionObject } from "../../src/schemas";

import { symbol } from "../../src/symbol";

export default function createSchemasTest(
  key: TestSchemas,
  system: NumberSystem,
) {
  schemas.ln = system.ln;
  schemas.lz = system.lz;

  switch (key) {
    case "isPosition":
      return _(key, function (item) {
        const position = new Position(system, item.value);
        const result = isPosition(position);
        expect(result).to.equal(item.expected);
      });
    case "isPositionObject":
      return _(key, function (item) {
        const symbolize = { symbol, ...item.value };
        const result =
          isPositionObject(symbolize) && isPositionObject(item.value);
        expect(result).to.equal(item.expected);
      });
    default:
      throw new Error(`Check if the handlers '${key}' test is missing`);
  }
}
