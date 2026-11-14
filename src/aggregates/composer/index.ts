// Interfaces
import IComposer from "../../interfaces/composer.js";
// Aggregates
import compose from "./compose.js";
import raw from "./raw.js";
import reduce from "./reduce.js";
import toString from "./get-string-builder.js";

const crafter = {
  reduce,
  raw,
  compose,
} as IComposer;

export { reduce, raw, compose, toString };
export default crafter;
