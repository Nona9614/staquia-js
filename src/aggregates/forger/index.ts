// Interfaces
import IForger from "../../interfaces/forger.js";
// Aggregates
import _from from "./from.js";
import forge from "./forge.js";
import core from "./core.js";
import start from "./start.js";
import next from "./next.js";
import previous from "./previous.js";

export { _from, forge, core, start, next, previous };

const forger: IForger = { from: _from, forge, core, start, next, previous };
export default forger;
