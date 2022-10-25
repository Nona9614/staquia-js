import { describe, it } from "mocha";
import { expect } from "chai";

import mocks from "./position.mocks";
import { system } from "../../src/system";
import StaquiaPosition, { sizes } from "../../src/staquia-position";

describe("Position Object Testing", () => {
    system.update(mocks.system);
    sizes.update(mocks.sizes);

    for (const spy of mocks.spies.object) {
        if (spy.test || mocks.testAll) {
            it(spy.message, () => {
                const position = new StaquiaPosition(spy.value);
                const string = position.toString();
                expect(string).to.equal(spy.expected);
            });
        }
    }

    for (const spy of mocks.spies.string) {
        if (spy.test || mocks.testAll) {
            it(spy.message, () => {
                const position = new StaquiaPosition(spy.value);
                const object = position.toObject();
                expect(object).to.eql(spy.expected);
            });
        }
    }

    it("Should get following position", () => {
        const position = new StaquiaPosition("a");
        const object = position.next();
        expect(object.toString()).to.equal("!!!b");
    });

    it("Should resolve overflow", () => {
        const position = new StaquiaPosition("!!!az");
        const object = position.next();
        expect(object.toString()).to.equal("!!!b");
    });

    it("Should divide properly the string", () => {
        const position = new StaquiaPosition("!!!azzzzzzzzzzzz");
        expect(position.n).to.equal("!!!a");
        expect(position.z).to.equal("zzzzzzzzzzzz");
    });

    it("Should get previous position", () => {
        const position = new StaquiaPosition("b");
        const object = position.previous();
        expect(object.toString()).to.equal("!!!a");
    });

    for (const spy of mocks.spies.core) {
        if (spy.test || mocks.testAll) {
            it(spy.message, () => {
                const before = new StaquiaPosition(spy.value.before);
                const after = new StaquiaPosition(spy.value.after);
                const core = before.core(after);
                expect(core.toString()).to.eql(spy.expected);
            });
        }
    }
});
