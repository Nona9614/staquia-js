// Node JS
import assert from "node:assert";
// Structures
import Spec from "../../structures/test-spec.js";
// Errors
import OverflowError from "../../../src/errors/overflow-error.js";
import ThresholdReachedError from "../../../src/errors/threshold-reached-error.js";
// Methods
import forger from "../../../src/aggregates/forger/index.js";
import getStringBuilder from "../../../src/aggregates/composer/get-string-builder.js";
// Decorators
import test from "../../decorators/test.decorator.js";
// Mocks
import inject from "../../inject.js";
import AlphabeticalSystem from "../../mocks/alphabetical-number-system.js";
import AlphabeticalDigits from "../../mocks/alphabetical-digits.js";
import AlphabeticalLexicon from "../../mocks/alphabetical-lexicon.js";
// Types
import type { IPositionResult } from "../../../src/results/position-result.js";
// Interfaces
import INumberSystem from "../../../src/interfaces/number-system.js";
import ILexicon from "../../../src/interfaces/lexicon.js";
import ICrafter from "../../../src/interfaces/crafter.js";
// Implementations
import Position, { derive } from "../../../src/entities/position.js";
import composer from "../../../src/aggregates/composer/index.js";
import setup from "../../decorators/setup.decorator.js";
import IUnicodes from "../../../src/interfaces/unicodes.js";
import IPosition from "../../../src/interfaces/position.js";
import { Err } from "../../../src/result.js";

const assert_result = (result: IPositionResult): IPosition => {
  if (!result.ok) {
    assert.ok(result.error, "The operation failed but the error object is empty.");
    throw result.error;
  }
  return result.value;
};

const assert_error = (result: IPositionResult, expected: string, instanceOf: { new (...args: any[]): Error }): IPosition => {
  if (result.ok) throw Error("The position did not return a failure in the result.");
  assert.ok(result.error, "The position returned a failure with an empty error.");
  const err = Object.getPrototypeOf(result).constructor;
  assert.equal(err, Err, `The method throws an error of type '${err?.name}' but a type of 'Err' was expected.`);
  const type = Object.getPrototypeOf(result.error).constructor;
  assert.equal(
    type,
    instanceOf,
    `The position throws an error of type '${type.constructor?.name}' but an error of type '${instanceOf.name}' was expected.`,
  );
  assert.equal(result.error!.message, expected);

  return (result.error as { position: IPosition }).position;
};

export default class ForgerTest extends Spec {
  private system: INumberSystem = new AlphabeticalSystem();
  private lexicon: ILexicon = new AlphabeticalLexicon();
  private crafter: ICrafter = {
    number: AlphabeticalDigits,
    position: Position,
  };
  private unicodes: IUnicodes = {
    firstUnicodeNumber: "a".codePointAt(0)!,
    lastUnicodeNumber: "z".codePointAt(0)!,
    zeroUnicodeNumber: "!".codePointAt(0)!,
  };

  constructor() {
    super("forger", "Integration Test");
  }

  @setup
  setup() {
    const reduce = inject(composer.reduce, {
      getCharacter: this.lexicon.getCharacter.bind({
        zero: this.system.zero,
        firstUnicodeNumber: this.unicodes.firstUnicodeNumber,
      }),
    });
    // Like a real system, the test owns a subclass instead of modifying the shared `Position` class
    this.crafter.position = derive(Position, getStringBuilder(reduce), "forger-test");
  }

  @test("Should forge a position from a string smaller than ln", "forge")
  forge_from_small_string() {
    // Arrange
    const n_string = "nux!";
    const z_string = "!";
    const forge = inject(forger.forge, this.lexicon, this.crafter, this.system);

    // Act
    const result = forge("nux");

    // Assert
    const position = assert_result(result);
    const n = position.n as AlphabeticalDigits;
    const z = position.z as AlphabeticalDigits;

    assert.equal(n.upperBound, 3, "upperBound");
    assert.equal(n.lowerBound, 0, "lowerBound");
    assert.equal(n.toString(), n_string, "position.n");

    assert.equal(z.upperBound, 0, "upperBound");
    assert.equal(z.lowerBound, 0, "lowerBound");
    assert.equal(z.toString(), z_string, "position.z");
  }

  @test("Should forge a position from a string bigger than ln", "forge")
  forge_from_bigger_string() {
    // Arrange
    const n_string = "kofe";
    const z_string = "qc";
    const forge = inject(forger.forge, this.lexicon, this.crafter, this.system);

    // Act
    const result = forge("kofeqc");

    // Assert
    const position = assert_result(result);
    const n = position.n as AlphabeticalDigits;
    const z = position.z as AlphabeticalDigits;

    assert.equal(n.upperBound, 3, "upperBound");
    assert.equal(n.lowerBound, 0, "lowerBound");
    assert.equal(n.toString(), n_string, "position.n");

    assert.equal(z.upperBound, 1, "upperBound");
    assert.equal(z.lowerBound, 0, "lowerBound");
    assert.equal(z.toString(), z_string, "position.z");
  }

  @test("Should forge a position from a string with length ln", "forge")
  forge_n_length_string() {
    // Arrange
    const n_string = "rjld";
    const z_string = "!";
    const forge = inject(forger.forge, this.lexicon, this.crafter, this.system);

    // Act
    const result = forge("rjld");

    // Assert
    const position = assert_result(result);
    const n = position.n as AlphabeticalDigits;
    const z = position.z as AlphabeticalDigits;

    assert.equal(n.upperBound, 3, "upperBound");
    assert.equal(n.lowerBound, 0, "lowerBound");
    assert.equal(n.toString(), n_string, "position.n");

    assert.equal(z.upperBound, 0, "upperBound");
    assert.equal(z.lowerBound, 0, "lowerBound");
    assert.equal(z.toString(), z_string, "position.z");
  }

  @test("Should transform a number shorter than N length", "from")
  from_shorter_than_N_number() {
    // Arrange
    const number = AlphabeticalDigits.from("ozv");
    const _from = inject(forger.from, this.lexicon, this.crafter, this.system);

    // Act
    const result = _from(number);

    // Assert
    const position = assert_result(result);
    const n = position.n as AlphabeticalDigits;
    const z = position.z as AlphabeticalDigits;

    assert.equal(n.upperBound, 3, "upperBound");
    assert.equal(n.lowerBound, 0, "lowerBound");
    assert.equal(n.toString(), "ozv!", "position.n");

    assert.equal(z.upperBound, 0, "upperBound");
    assert.equal(z.lowerBound, 0, "lowerBound");
    assert.equal(z.toString(), "!", "position.z");
  }

  @test("Should transform a number equal to N length", "from")
  from_equal_to_N_number() {
    // Arrange
    const number = AlphabeticalDigits.from("ozvx");
    const _from = inject(forger.from, this.lexicon, this.crafter, this.system);

    // Act
    const result = _from(number);

    // Assert
    const position = assert_result(result);
    const n = position.n as AlphabeticalDigits;
    const z = position.z as AlphabeticalDigits;

    assert.equal(n.upperBound, 3, "upperBound");
    assert.equal(n.lowerBound, 0, "lowerBound");
    assert.equal(n.toString(), "ozvx", "position.n");

    assert.equal(z.upperBound, 0, "upperBound");
    assert.equal(z.lowerBound, 0, "lowerBound");
    assert.equal(z.toString(), "!", "position.z");
  }

  @test("Should transform a number bigger than N length", "from")
  from_bigger_than_N_number() {
    // Arrange
    const number = AlphabeticalDigits.from("ozvxklwqr");
    const _from = inject(forger.from, this.lexicon, this.crafter, this.system);

    // Act
    const result = _from(number);

    // Assert
    const position = assert_result(result);
    const n = position.n as AlphabeticalDigits;
    const z = position.z as AlphabeticalDigits;

    assert.equal(n.upperBound, 3, "n.upperBound");
    assert.equal(n.lowerBound, 0, "n.lowerBound");
    assert.equal(n.toString(), "ozvx");

    assert.equal(z.upperBound, 4, "z.upperBound");
    assert.equal(z.lowerBound, 0, "z.lowerBound");
    assert.equal(z.toString(), "klwqr");
  }

  @test("Should mark the number as a threshold reached warning", "from")
  from_dangerous_number() {
    // Arrange
    const diff = this.system.lmax - this.system.lϰ;
    const string = "ozvx!klwqrbvdj";
    const number = AlphabeticalDigits.from(string);
    const _from = inject(forger.from, this.lexicon, this.crafter, this.system);

    // Act
    const result = _from(number);

    // Assert
    const position = assert_error(
      result,
      `The position "${string}" with '${string.length}' reached the thereshold '${this.system.lϰ}'.\nThe system is about '${diff}' character's length before it causes an overflow.`,
      ThresholdReachedError,
    );
    const n = position.n as AlphabeticalDigits;
    const z = position.z as AlphabeticalDigits;

    assert.equal(n.upperBound, 3, "n.upperBound");
    assert.equal(n.lowerBound, 0, "n.lowerBound");
    assert.equal(n.toString(), "ozvx", "position.n");

    assert.equal(z.upperBound, 9, "z.upperBound");
    assert.equal(z.lowerBound, 0, "z.lowerBound");
    assert.equal(z.toString(), "!klwqrbvdj", "position.z");
  }

  @test("Should mark the number as an overflow", "from")
  from_overflowed_number() {
    // Arrange
    const string = "ozvx!klwqrbvdjeyh";
    const number = AlphabeticalDigits.from(string);
    const _from = inject(forger.from, this.lexicon, this.crafter, this.system);

    // Act
    const result = _from(number);

    // Assert
    const position = assert_error(
      result,
      `The position "${string}" caused an overflow as its length '${string.length}' is bigger than the allowed system length '${this.system.lmax}'.`,
      OverflowError,
    );

    const n = position.n as AlphabeticalDigits;
    const z = position.z as AlphabeticalDigits;

    assert.equal(n.upperBound, 3, "n.upperBound");
    assert.equal(n.lowerBound, 0, "n.lowerBound");
    assert.equal(n.toString(), "ozvx", "position.n");

    assert.equal(z.upperBound, 12, "z.upperBound");
    assert.equal(z.lowerBound, 0, "z.lowerBound");
    assert.equal(z.toString(), "!klwqrbvdjeyh", "position.z");
  }

  @test("Should parse a number with lower bound", "from")
  from_number_with_lower_bound() {
    // Arrange
    const number = new AlphabeticalDigits();
    number._map = new Map([
      [3, 1], // a
      [2, 2], // b
      [1, 3], // c
      [0, 4], // d
      [-1, 5], // e
      [-2, 6], // f
    ]);
    number.upperBound = 3;
    number.lowerBound = -2;
    const _from = inject(forger.from, this.lexicon, this.crafter, this.system);

    // Act
    const result = _from(number);

    // Assert
    const position = assert_result(result);
    const n = position.n as AlphabeticalDigits;
    const z = position.z as AlphabeticalDigits;

    assert.equal(n.upperBound, 3, "n.upperBound");
    assert.equal(n.lowerBound, 0, "n.lowerBound");
    assert.equal(n.toString(), "abcd", "position.n");

    assert.equal(z.upperBound, 1, "z.upperBound");
    assert.equal(z.lowerBound, 0, "z.lowerBound");
    assert.equal(z.toString(), "ef", "position.z");
  }
}
