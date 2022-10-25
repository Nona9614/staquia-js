import { describe, it } from "mocha";
import { expect } from "chai";

import mocks from "./between.mocks";
import { system, between } from "../../src/system";

describe("Between Testing", () => {
    system.update(mocks.system);

    for (const spy of mocks.spies) {
        if (spy.use || mocks.useAll) {
            it(spy.message, () => {
                const _between = between(spy.after, spy.before, spy.round ?? true);
                expect(_between).to.equal(spy.expected);
            });
        }
    }
});
