// Errors
import SystemMismatchError from "../../errors/system-mismatch-error.js";
// Results
import { Err } from "../../result.js";
// Interfaces
import ICrafter from "../../interfaces/crafter.js";
import IPosition from "../../interfaces/position.js";
// Entities
import { SIGNATURE } from "../../entities/position.js";

/**
 * Verifies that the position was created by a system with the same configuration (the same
 * characters and `n` length), as only then its digits have the same meaning. Each system owns
 * its position class, which carries the configuration as a hidden signature.
 *
 * @param system The system that will use the position.
 * @param position The position to check.
 * @returns The error if the position was created by another system, otherwise `undefined`.
 */
export default function isForeign(system: ICrafter, position: IPosition): Err<SystemMismatchError> | undefined {
  const signature = (system.position.prototype as any)[SIGNATURE];
  if ((position as any)[SIGNATURE] === signature) return undefined;
  return new Err(SystemMismatchError.create(position));
}
