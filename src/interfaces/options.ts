// Intefaces
import ICrafter from "./crafter.js";

/**
 * The options of `Staquia.create`: the classes used to create the positions (`position`) and their
 * numbers (`number`). Both are optional, `Position` and `Digits` are used by default.
 *
 * The class passed is never modified: each system creates its own subclass of it, so the same class
 * can be passed to many systems and `instanceof` works as usual.
 *
 * There are no handlers for the overflow or the threshold: every function that may fail returns a
 * `Result` that is checked synchronously instead.
 *
 * @example
 * import Staquia, { Position } from "staquia";
 *
 * class JsonPosition extends Position {
 *   // Serializes the position as its string instead of its internal digits
 *   toJSON() {
 *     return this.toString();
 *   }
 * }
 *
 * const system = Staquia.create("!", "a", "z", 5, 15, 0.15, { position: JsonPosition });
 *
 * const start = system.start();
 * if (start.ok) {
 *   console.log(start.value instanceof JsonPosition); // true
 *   console.log(JSON.stringify({ id: 1, position: start.value })); // '{"id":1,"position":"mmmmm!"}'
 * }
 */
export default interface IStaquiaOptions extends Partial<ICrafter> {}
