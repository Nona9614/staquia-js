import { describe, it } from "mocha";
import { expect } from "chai";

import mocks from "./after.mocks";
import { system, after } from "../../src/system";

describe("After Testing", () => {
    system.update(mocks.system);

    for (const spy of mocks.spies) {
        if (spy.use || mocks.useAll) {
            it(spy.message, () => {
                const _after = after(spy.value);
                expect(_after).to.equal(spy.expected);
            });
        }
    }
});
