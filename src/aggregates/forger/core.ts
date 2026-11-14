// Structures
import isPosition from "./is-position.js";
import isForeign from "./is-foreign.js";
// Interfaces
import IAlgorithms from "../../interfaces/algorithms.js";
import IForger from "../../interfaces/forger.js";
import IComposer from "../../interfaces/composer.js";
import ICrafter from "../../interfaces/crafter.js";
import INumberSystem from "../../interfaces/number-system.js";
import IPosition from "../../interfaces/position.js";
import type { IPositionResult } from "../../results/position-result.js";

export default function core(
  this: INumberSystem & ICrafter & IAlgorithms & IForger & IComposer,
  previous: IPosition | IPositionResult,
  next: IPosition | IPositionResult,
): IPositionResult {
  // If some of the positions failed just returned a failed response
  let _previous: IPosition;
  let _next: IPosition;
  if (isPosition(previous)) {
    _previous = previous;
  } else {
    if (!previous.ok) return previous;
    _previous = previous.value;
  }
  if (isPosition(next)) {
    _next = next;
  } else {
    if (!next.ok) return next;
    _next = next.value;
  }
  // Positions from other systems have different digits
  const foreign = isForeign(this, _previous) ?? isForeign(this, _next);
  if (foreign) return foreign;
  // Orders the gretater and the smaller
  let _temp: IPosition;
  if (_previous.greater(_next)) {
    _temp = _previous;
    _previous = _next;
    _next = _temp;
  }

  // The final result position
  let _final: IPositionResult;

  // Substracts to check if there is not enough room (above 1) use diverge,
  // if not use between
  const substraction = this.substract(_previous.n, _next.n);
  if (substraction.upperBound === 0 && substraction.get(0) < 2) {
    // Gets the position as numbers
    let _previousUpperBound = _previous.n.upperBound + _previous.z.upperBound + 1;
    let _nextUpperBound = _next.n.upperBound + _next.z.upperBound + 1;
    // Gets the values using diverge
    let __previous = this.raw(_previous, _previousUpperBound);
    let __next = this.raw(_next, _nextUpperBound);
    _final = this.from(this.diverge(__previous, __next));
  } else {
    _final = this.from(this.between(_previous.n, _next.n, true));
  }

  return _final;
}
