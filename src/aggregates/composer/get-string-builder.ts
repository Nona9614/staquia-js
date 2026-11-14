// Interfaces
import IComposer from "../../interfaces/composer.js";
import IPosition from "../../interfaces/position.js";

export default function getStringBuilder(reduce: IComposer["reduce"]): (this: IPosition) => string {
  // It cannot use an `isZero` method because if the user is restoring a position
  // from a string, and the zero symbol was valid as it was generated due to a reinsertion
  // that information will be lost from the Z segment.
  // Only ignore the Z segment when it actually has no content i.e. the internal map has no values.
  return function getString(this: IPosition) {
    if (this.z.isEmpty()) {
      return reduce(this.n);
    } else {
      let n = reduce(this.n);
      let z = reduce(this.z);
      return n + z;
    }
  };
}
