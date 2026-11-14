// Chai
import { expect } from "chai";
// Structures
import Spec from "../../structures/test-spec.js";
// Mocks
import inject from "../../inject.js";
import mock, { noop } from "../../mock.js";
// Decorators
import setup from "../../decorators/setup.decorator.js";
import test from "../../decorators/test.decorator.js";
// Mocks
import AlphabeticalSystem from "../../mocks/alphabetical-number-system.js";
// Interfaces
import IDigits from "../../../src/interfaces/digits.js";
import IAlgorithms from "../../../src/interfaces/algorithms.js";
// Aggregates
import algorithms from "../../../src/aggregates/algorithms/index.js";

class AlgorithmsTest extends Spec {
  private readonly system = new AlphabeticalSystem();
  private algorithms: IAlgorithms = null!;

  constructor() {
    super("algorithms", "Unit Test")
  }

  @setup
  init() {
    this.algorithms = mock<IAlgorithms>({
      resolveOverflow: () => {},
    });
  }

  @test("Should go one value after")
  after_test(): void {
    // Arrange
    const number: IDigits = mock<IDigits>({
      upperBound: 0,
      lowerBound: 0,
      clone: () => number,
      compact: noop(),
      update: () => (number.upperBound = 1),
      expand: () => (number.upperBound = 2),
      pop: () => (number.upperBound = 1),
      isKeyZero: () => true,
      isZero: () => true,
    });
    const round = false;
    const after = inject(algorithms.after, this.system, this.algorithms);

    // Act
    const result = after(number, round);

    // Assert
    expect(result.upperBound).to.equal(1);
  }
}

export default AlgorithmsTest;
