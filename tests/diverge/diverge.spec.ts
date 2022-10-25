import { describe, it } from "mocha";
import { expect } from "chai";

import mocks from "./diverge.mocks";
import { system, criteria, diverge } from "../../src/system";

describe("Criteria Testing", () => {
    it("Should be true as yz < zl < zz", () => {
        const result = criteria("zl", "yz", "zz");
        expect(result).to.equal(true);
    })
})

describe("Diverge Testing", () => {
    system.update(mocks.system);

    for (const spy of mocks.spies) {
        if (spy.use || mocks.useAll) {
            it(spy.message, () => {
                const diverged = diverge(spy.after, spy.before);
                expect(diverged).to.equal(spy.expected);
            });
        }
    }
});
