import { expect } from "chai";
import _ from "../create-callee";
import type {
  NumberSystem,
  OverflowHandler,
  ThreseholdHandler,
} from "../../src/types";
import type { TestHandlers } from "../types";

import Position from "../../src/position";
import { handlers } from "../../src/handlers";

export default function createHandlerTest(
  key: TestHandlers,
  system: NumberSystem,
) {
  switch (key) {
    case "onThreshold":
      return _(key, function (item, done) {
        let triggered: boolean = undefined as any;
        const onThreshold: ThreseholdHandler = (trigger) => {
          triggered = trigger.toString() === item.trigger;
        };
        handlers.onThreshold = onThreshold;
        const core = new Position(system, item.before).core(item.next);

        if (triggered === item.expected) done();
        else
          done(
            Error(
              `Threshold callback not acting as expected, using lϰ = ${system.lϰ}`,
            ),
          );
        return true;
      });
    case "onOverflow":
      return _(key, function (item, done) {
        let triggered: boolean = undefined as any;
        const onOverflow: OverflowHandler = (trigger) => {
          triggered = trigger.toString() === item.trigger;
        };
        handlers.onOverflow = onOverflow;
        const core = new Position(system, item.before).core(item.next);

        if (triggered === item.expected) done();
        else
          done(
            Error(
              `Overflow callback not acting as expected, using lmax = ${system.lmax}`,
            ),
          );
        return true;
      });
    default:
      throw new Error(`Check if the handlers' key '${key}' test is missing`);
  }
}
