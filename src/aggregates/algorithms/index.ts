// Intefaces
import IAlgorithms from "../../interfaces/algorithms.js";
// Aggregates
import after from "./after.js";
import before from "./before.js";
import between from "./between.js";
import diverge from "./diverge.js";
import clean from "./clean.js";
import compactNumbers from "./compact-numbers.js";
import half from "./half.js";
import resolveOverflow from "./resolve-overflow.js";
import substract from "./substract.js";

export { clean, after, before, between, diverge, compactNumbers, half, resolveOverflow, substract };
const algorithms: IAlgorithms = { clean, after, before, between, diverge, compactNumbers, half, resolveOverflow, substract };

export default algorithms;
