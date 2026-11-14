// Chai
import assert from "node:assert";
// Structures
import Spec from "../../structures/test-spec.js";
// Methods
import composer from "../../../src/aggregates/composer/index.js";
// Decorators
import test from "../../decorators/test.decorator.js";
// Mocks
import inject from "../../inject.js";
import AlphabeticalSystem from "../../mocks/alphabetical-number-system.js";
import AlphabeticalDigits from "../../mocks/alphabetical-digits.js";
import AlphabeticalLexicon from "../../mocks/alphabetical-lexicon.js";
// Interfaces
import INumberSystem from "../../../src/interfaces/number-system.js";
import ILexicon from "../../../src/interfaces/lexicon.js";
import ICrafter from "../../../src/interfaces/crafter.js";
// Implementations
import Position from "../../../src/entities/position.js";

export default class ComposerTest extends Spec {
  private lexicon: ILexicon = new AlphabeticalLexicon();
  private crafter: ICrafter = {
    number: AlphabeticalDigits,
    position: Position,
  };

  constructor() {
    super("composer", "Integration Test");
  }

  @test("Should transform the digits to their string values", "reduce")
  reduce_short_digits() {
    // Arrange
    const n_digits = AlphabeticalDigits.from("ldix");
    const reduce = inject(composer.reduce, this.lexicon);

    // Act
    const reduced = reduce(n_digits);

    // Assert
    assert.equal(reduced.length, 4, "length");
    assert.equal(reduced, "ldix", "string");
  }

  @test("Should transform the long digits to their string values", "reduce")
  reduce_long_digits() {
    // Arrange
    const n_z_digits = AlphabeticalDigits.from("ldixjvep");
    const reduce = inject(composer.reduce, this.lexicon);

    // Act
    const reduced = reduce(n_z_digits);

    // Assert
    assert.equal(reduced.length, 8, "length");
    assert.equal(reduced, "ldixjvep", "string");
  }

  @test("Should transorm a position to a number", "raw")
  raw_position_to_number() {
    // Arrange
    const n_string = "ozvx";
    const z_string = "!klwqrbvdjeyh";
    const position = new Position();
    position.n = AlphabeticalDigits.from(n_string);
    position.z = AlphabeticalDigits.from(z_string);
    const raw = inject(composer.raw, this.crafter);

    // Act
    const number = raw(position, 16);

    // Assert
    assert.equal(number.upperBound, 16, "upperBound");
    assert.equal(number.lowerBound, 0, "lowerBound");
    assert.equal(number.toString(), "ozvx!klwqrbvdjeyh");
  }

  @test("Should transorm a position to a number and extend it with zeroes", "raw")
  raw_position_to_number_extended() {
    // Arrange
    const n_string = "ozvx";
    const z_string = "!klwqrbvdjeyh";
    const position = new Position();
    position.n = AlphabeticalDigits.from(n_string);
    position.z = AlphabeticalDigits.from(z_string);
    const raw = inject(composer.raw, this.crafter);

    // Act
    const number = raw(position, 20);

    // Assert
    assert.equal(number.upperBound, 20, "upperBound");
    assert.equal(number.lowerBound, 0, "lowerBound");
    assert.equal(number.toString(), "ozvx!klwqrbvdjeyh!!!!");
  }
}
