// Guards
import isPosition from "./is-position.js";
import isForeign from "./is-foreign.js";
// Results
import { Err } from "../../result.js";
// Errors
import OverflowError from "../../errors/overflow-error.js";
// Types
import type { IPositionResult } from "../../results/position-result.js";
// Interfaces
import IAlgorithms from "../../interfaces/algorithms.js";
import ICrafter from "../../interfaces/crafter.js";
import IForger from "../../interfaces/forger.js";
import INumberSystem from "../../interfaces/number-system.js";
import IPosition from "../../interfaces/position.js";

export default function next(this: INumberSystem & ICrafter & IForger & IAlgorithms, reference: IPosition | IPositionResult): IPositionResult {
  let _reference: IPosition;
  if (isPosition(reference)) {
    _reference = reference;
  } else {
    if (!reference.ok) return reference;
    _reference = reference.value;
  }
  // Positions from other systems have different digits
  const foreign = isForeign(this, _reference);
  if (foreign) return foreign;
  // `n` has a fixed size, so its leading zeroes must be kept (no trim)
  const after = this.after(_reference.n, false);
  // A carry beyond the fixed `n` size means `n` was already the last value
  if (after.upperBound >= this.ln) return new Err(OverflowError.limit(_reference, "next"));
  return this.from(after);
}
