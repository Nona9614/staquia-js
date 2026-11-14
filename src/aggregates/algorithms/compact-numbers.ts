// Interfaces
import IDigits from "../../interfaces/digits.js";
import INumberSystem from "../../interfaces/number-system.js";
import HalfMode from "../../unions/half-mode.js";

/**
 * These arrays will parse the string representing a nth base number where
 * the numbers will have the same size including zeroes (to the right for
 * diverge or left for between) to the one that needs it
 * i.e. yz ~ zzy --> yz! ~ zzy
 */
export default function compactNumbers(this: INumberSystem, number1: IDigits, number2: IDigits, repeated: IDigits, mode: HalfMode) {
  // Based on the half type reorder the items
  switch (mode) {
    case "between": {
      let diff = number1.upperBound - number2.upperBound;
      // Pads to the left with zeroes
      if (diff < 0) {
        number1.expand(-diff);
      }
      // Pads to the left with zeroes
      else if (diff > 0) {
        number2.expand(diff);
      }
      break;
    }
    case "diverge": {
      let diff = number1.upperBound - number2.upperBound;
      // Pads to the right with zeroes
      if (diff < 0) {
        number1.extend(-diff);
      }
      // Pads to the right with zeroes
      else if (diff > 0) {
        number2.extend(diff);
      }
      break;
    }
  }

  // Ensure value1 < value2
  if (number1.greater(number2)) {
    const temp = number1.clone();
    number1.reference(number2);
    number2.reference(temp);
  }

  // The containing repeated values
  let repeatedCodes = new Array<number>();

  // Removes any repeated values until their differ
  let code1: number;
  let code2: number;
  let index = number1.upperBound;
  while (index > -1) {
    code1 = number1.get(index);
    code2 = number2.get(index);
    if (code1 == code2) {
      // Removes the repetead digit
      number1.pop();
      number2.pop();
      // Appends the new found repeated number
      repeatedCodes.push(code1);
      index -= 1;
    } else {
      break;
    }
  }

  // Update the repeated values
  repeated.upperBound = repeatedCodes.length - 1;
  let ix: number = repeated.upperBound;
  for (const code of repeatedCodes) {
    repeated.set(ix, code);
    ix -= 1;
  }
}
