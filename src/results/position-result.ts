// Result
import { Result, Err, Ok } from "../result.js";
// Errors
import OverflowError from "../errors/overflow-error.js";
import ThresholdReachedError from "../errors/threshold-reached-error.js";
import { IPositionError } from "../errors/position-error.js";
// Interfaces
import INumberSystem from "../interfaces/number-system.js";
import IComposer from "../interfaces/composer.js";
import IPosition from "../interfaces/position.js";
import ICrafter from "../interfaces/crafter.js";
import IDigits from "../interfaces/digits.js";

// Aliases
export type IPositionResult = Result<IPosition, IPositionError>;

/**
 * Creates a new response based on the input
 * @param system The system used to generate the position information
 * @param data The position data
 */
const result = (
  system: INumberSystem & IComposer & ICrafter,
  data: {
    n: IDigits;
    z: IDigits;
    length: number;
  },
): IPositionResult => {
  const position = new system.position();
  position.n = data.n;
  position.z = data.z;
  (position as any).length = data.length;

  if (data.length > system.lmax) {
    return new Err(OverflowError.create(system, position));
  }
  if (data.length >= system.lϰ) {
    return new Err(ThresholdReachedError.create(system, position));
  }

  return new Ok(position);
};

export default result;
