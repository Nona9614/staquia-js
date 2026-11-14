import IDigits from "../../interfaces/digits.js";

/** Uses the current system `Number` class and intializes it with empty values */
export default function create(number: new () => IDigits) {
  const instance = new number();
  instance._map = new Map();
  instance.lowerBound = 0;
  instance.upperBound = 0;
  return instance;
}
