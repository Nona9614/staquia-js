// Unions
import Ordering from "../../../unions/ordering.js";
// Interfaces
import IDigits from "../../../interfaces/digits.js";

const comparator = (left: IDigits, right: IDigits): Ordering => {
  // Find the exact range where BOTH arrays have valid data
  const minUpperBound = left.upperBound < right.upperBound ? left.upperBound : right.upperBound;
  const maxLowerBound = left.lowerBound > right.lowerBound ? left.lowerBound : right.lowerBound;

  // 1. High-Value Zone: If one array extends higher than the other's upperBound,
  // those extra digits are compared against implicit 0s.
  if (left.upperBound !== right.upperBound) {
    const highestUB = left.upperBound > right.upperBound ? left.upperBound : right.upperBound;
    const lowestUB = minUpperBound;
    
    // Scan down through the unaligned top digits
    for (let n = highestUB; n > lowestUB; n--) {
      const _left = n <= left.upperBound ? left.get(n) : 0;
      const _right = n <= right.upperBound ? right.get(n) : 0;
      if (_left !== _right) {
        return _left > _right ? "greater" : "less";
      }
    }
  }

  // 2. Core Overlap Zone: Perfect direct matching with zero branch overhead
  for (let n = minUpperBound; n >= maxLowerBound; n--) {
    const _left = left.get(n);
    const _right = right.get(n);

    if (_left !== _right) {
      return _left > _right ? "greater" : "less";
    }
  }

  // 3. Low-Value Zone: If one array extends lower than the other's lowerBound,
  // check those remaining bottom digits against implicit 0s.
  if (left.lowerBound !== right.lowerBound) {
    const lowestLB = left.lowerBound < right.lowerBound ? left.lowerBound : right.lowerBound;
    const highestLB = maxLowerBound;

    for (let n = highestLB - 1; n >= lowestLB; n--) {
      const _left = n >= left.lowerBound ? left.get(n) : 0;
      const _right = n >= right.lowerBound ? right.get(n) : 0;
      if (_left !== _right) {
        return _left > _right ? "greater" : "less";
      }
    }
  }

  return "equal";
};

export default comparator;
