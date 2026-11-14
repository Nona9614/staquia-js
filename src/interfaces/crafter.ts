// Interfaces
import IDigits from "./digits.js";
import IPosition from "./position.js";

/** The classes a system uses to create empty numbers and positions, see `IStaquiaOptions`. */
export default interface ICrafter {
  /**
   * The class of the numbers (`Digits` by default). The system creates its instances with `new` and
   * then initializes their digits, bounds and map.
   */
  number: { new (): IDigits };
  /**
   * The class of the positions (`Position` by default). The system creates its instances with `new`
   * and then sets their `n`, `z` and `length`.
   */
  position: { new (): IPosition };
}
