import { describe, it } from "mocha";
import { expect } from "chai";

import mocks from "./before.mocks";
import { system, before } from "../../src/system";

describe("Before Testing", () => {
    system.update(mocks.system);

    for (const spy of mocks.spies) {
        if (spy.use || mocks.useAll) {
            it(spy.message, () => {
                const _before = before(spy.value);
                expect(_before).to.equal(spy.expected);
            });
        }
    }
});
