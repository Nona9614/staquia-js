// Chai
import { expect } from "chai";
// Structures
import Spec from "../../structures/test-spec.js";
// Decorators
import test from "../../decorators/test.decorator.js";
// Mocks
import AlphabeticalDigits from "../../mocks/alphabetical-digits.js";
// Implementations
import JsonDigit from "../../mocks/json-digits.js";

class NumberTest extends Spec {
  constructor() {
    super("number", "Unit Test")
  }

  @test("Should clone all the digits")
  clone(): void {
    // Arrange
    const digits = {
      0: 1,
      1: 1,
      2: 1,
    };
    const sut = JsonDigit.from(digits);

    // Act
    const copy = sut.clone() as JsonDigit;
    const json = copy.toJson();

    // Assert
    expect(sut.lowerBound).to.equal(0);
    expect(sut.upperBound).to.equal(2);
    expect(json).to.eql({
      0: 1,
      1: 1,
      2: 1,
    });
  }

  @test("Should go pop the last digit")
  pop(): void {
    // Arrange
    const digits = {
      0: 1,
      1: 1,
      2: 1,
    };
    const sut = JsonDigit.from(digits);

    // Act
    sut.pop();
    const json = sut.toJson();

    // Assert
    expect(sut.lowerBound).to.equal(0);
    expect(sut.upperBound).to.equal(1);
    expect(json).to.eql({
      0: 1,
      1: 1,
    });
  }

  @test("Should extend the number with 2 zeroes to the left")
  expand() {
    // Arrange
    const abz = AlphabeticalDigits.from("abz");

    // Act
    abz.expand(2);

    // Assert
    expect(abz.toString(), '"abz" extends to "!!abz"').to.equal("!!abz");
  }

  @test("Should extend the number with 2 zeroes to the right")
  extend() {
    // Arrange
    const abz = AlphabeticalDigits.from("abz");

    // Act
    abz.extend(2);

    // Assert
    expect(abz.toString(), '"abz" extends to "abz!!"').to.equal("abz!!");
  }

  @test("Should stack the passed number to the top of the caller")
  stack() {
    // Arrange
    const top = AlphabeticalDigits.from("nnnn");
    const number = AlphabeticalDigits.from("zzzz");

    // Act
    number.stack(top);

    // Assert
    expect(number.toString(), '"nnnn" + "zzzz" = "nnnnzzzz"').to.equal("nnnnzzzz");
  }

  //#region `compact` Tests
  @test("Should remove all leading zeroes", "compact")
  compact_number_000z000() {
    // Arrange
    const number = AlphabeticalDigits.from("!!!z!!!");

    // Act
    number.compact();

    // Assert
    expect(number.toString(), '"!!!z!!!" -> "z!!!"').to.equal("z!!!");
  }

  @test("Should remove all leading zeroes", "compact")
  compact_number_000000() {
    // Arrange
    const number = AlphabeticalDigits.from("!!!!!!");

    // Act
    number.compact();

    // Assert
    expect(number.toString(), '"!!!!!!" -> "!"').to.equal("!");
  }
  //#endregion

  //#region `greater` Tests
  @test("Should return false when the left number is not greater than the right number", "greater-than")
  greater_than_left_a_right_b() {
    // Arrange
    const a = AlphabeticalDigits.from("a");
    const b = AlphabeticalDigits.from("b");

    // Act
    const result = a.greater(b);

    // Assert
    expect(result, '"a" > "b"').to.false;
  }

  @test("Should return true when the number is greater than the false number", "greater-than")
  greater_than_left_b_right_a() {
    // Arrange
    const b = AlphabeticalDigits.from("b");
    const a = AlphabeticalDigits.from("a");

    // Act
    const result = b.greater(a);

    // Assert
    expect(result, '"b" > "a"').to.true;
  }

  @test("Should return true when the long number is greater than the right long number", "greater-than")
  greater_than_left_cba_right_abc() {
    // Arrange
    const cba = AlphabeticalDigits.from("cba");
    const abc = AlphabeticalDigits.from("abc");

    // Act
    const result = cba.greater(abc);

    // Assert
    expect(result, '"cba" > "abc"').to.true;
  }

  @test("Should return true when the number with repeated digits is greater than the right number", "greater-than")
  greater_than_left_xyz_right_xyy() {
    // Arrange
    const xyz = AlphabeticalDigits.from("xyz");
    const xyy = AlphabeticalDigits.from("xyy");

    // Act
    const result = xyz.greater(xyy);

    // Assert
    expect(result, '"xyz" > "xyy"').to.true;
  }
  //#endregion

  //#region `greaterOrEqual` Tests
  @test("Should return false when the left number is not greater or equal than the right number", "greater-or-equal-than")
  greater_or_equal_than_left_a_right_b() {
    // Arrange
    const a = AlphabeticalDigits.from("a");
    const b = AlphabeticalDigits.from("b");

    // Act
    const result = a.greaterOrEqual(b);

    // Assert
    expect(result, '"a" >= "b"').to.false;
  }

  @test("Should return true when the number is greater or equal than the false number", "greater-or-equal-than")
  greater_or_equal_than_left_b_right_a() {
    // Arrange
    const b = AlphabeticalDigits.from("b");
    const a = AlphabeticalDigits.from("a");

    // Act
    const result = b.greaterOrEqual(a);

    // Assert
    expect(result, '"b" >= "a"').to.true;
  }

  @test("Should return true when the numbers are equal but they may contain leading zeroes", "greater-or-equal-than")
  greater_or_equal_than_left_00n_right_0n() {
    // Arrange
    const _00n = AlphabeticalDigits.from("!!n");
    const _0n = AlphabeticalDigits.from("!n");

    // Act
    const result = _00n.greaterOrEqual(_0n);

    // Assert
    expect(result, '"!!n" >= "!n"').to.true;
  }

  @test("Should return true when the long number is greater or equal than the right long number", "greater-or-equal-than")
  greater_or_equal_than_left_cba_right_abc() {
    // Arrange
    const cba = AlphabeticalDigits.from("cba");
    const abc = AlphabeticalDigits.from("abc");

    // Act
    const result = cba.greaterOrEqual(abc);

    // Assert
    expect(result, '"cba" >= "abc"').to.true;
  }
  //#endregion

  //#region `less` Tests
  @test("Should return false when the left number is not less than the right number", "less-than")
  less_than_left_b_right_a() {
    // Arrange
    const b = AlphabeticalDigits.from("b");
    const a = AlphabeticalDigits.from("a");

    // Act
    const result = b.less(a);

    // Assert
    expect(result, '"b" < "a"').to.false;
  }

  @test("Should return true when the number is less than the false number", "less-than")
  less_than_left_a_right_b() {
    // Arrange
    const a = AlphabeticalDigits.from("a");
    const b = AlphabeticalDigits.from("b");

    // Act
    const result = a.less(b);

    // Assert
    expect(result, '"a" < "b"').to.true;
  }

  @test("Should return true when the long number is less than the right long number", "less-than")
  less_than_left_abc_right_cba() {
    // Arrange
    const abc = AlphabeticalDigits.from("abc");
    const cba = AlphabeticalDigits.from("cba");

    // Act
    const result = abc.less(cba);

    // Assert
    expect(result, '"abc" < "cba"').to.true;
  }

  @test("Should return true when the number with repeated digits is less than the right number", "less-than")
  less_than_left_xyy_right_xyzr() {
    // Arrange
    const xyy = AlphabeticalDigits.from("xyy");
    const xyzr = AlphabeticalDigits.from("xyzr");

    // Act
    const result = xyy.less(xyzr);

    // Assert
    expect(result, '"xyy" < "xyzr"').to.true;
  }
  //#endregion

  //#region `lessOrEqual` Tests
  @test("Should return false when the left number is not less or equal than the right number", "less-or-equal-than")
  less_or_equal_than_left_b_right_a() {
    // Arrange
    const b = AlphabeticalDigits.from("b");
    const a = AlphabeticalDigits.from("a");

    // Act
    const result = b.lessOrEqual(a);

    // Assert
    expect(result, '"b" >= "a"').to.false;
  }

  @test("Should return true when the number is less or equal than the false number", "less-or-equal-than")
  less_or_equal_than_left_a_right_b() {
    // Arrange
    const a = AlphabeticalDigits.from("a");
    const b = AlphabeticalDigits.from("b");

    // Act
    const result = a.lessOrEqual(b);

    // Assert
    expect(result, '"a" >= "b"').to.true;
  }

  @test("Should return true when the numbers are equal but they may contain leading zeroes", "less-or-equal-than")
  less_or_equal_than_left_n_right_00n() {
    // Arrange
    const _n = AlphabeticalDigits.from("n");
    const _000n = AlphabeticalDigits.from("!!!n");

    // Act
    const result = _n.lessOrEqual(_000n);

    // Assert
    expect(result, '"n" >= "!!!n"').to.true;
  }

  @test("Should return true when the long number is less or equal than the right long number", "less-or-equal-than")
  less_or_equal_than_left_abc_right_cba() {
    // Arrange
    const abc = AlphabeticalDigits.from("abc");
    const cba = AlphabeticalDigits.from("cba");

    // Act
    const result = abc.lessOrEqual(cba);

    // Assert
    expect(result, '"abc" >= "cba"').to.true;
  }

  @test("Should return true when the number with repeated digits is less or equal than the right number", "less-or-equal-than")
  less_or_equal_than_left_xyy_right_xyzr() {
    // Arrange
    const xyy = AlphabeticalDigits.from("xyy");
    const xyzr = AlphabeticalDigits.from("xyzr");

    // Act
    const result = xyy.lessOrEqual(xyzr);

    // Assert
    expect(result, '"xyy" >= "xyzr"').to.true;
  }
  //#endregion

  //#region `equal` Tests
  @test("Should return false when the left number is not equal to the right number", "equal-to")
  equal_to_left_a_right_b() {
    // Arrange
    const a = AlphabeticalDigits.from("a");
    const _b = AlphabeticalDigits.from("b");

    // Act
    const result = a.equal(_b);

    // Assert
    expect(result, '"a" == "b"').to.false;
  }

  @test("Should return true when the number is equal to the false number", "equal-to")
  equal_to_left_n_right_n() {
    // Arrange
    const n = AlphabeticalDigits.from("n");
    const _n = AlphabeticalDigits.from("n");

    // Act
    const result = n.equal(_n);

    // Assert
    expect(result, '"n" == "n"').to.true;
  }

  @test("Should return true when the long number is equal to the right long number", "equal-to")
  equal_to_left_xyz_right_xyz() {
    // Arrange
    const xyz = AlphabeticalDigits.from("xyz");
    const _xyz = AlphabeticalDigits.from("xyz");

    // Act
    const result = xyz.equal(_xyz);

    // Assert
    expect(result, '"xyz" == "xyz"').to.true;
  }
  //#endregion

  //#region `compare` Tests
  @test("Should return 'greater' when the left value is bigger than the right value", "compare")
  compare_left_tr0xu0_right_tr0kzn() {
    // Arrange
    const tr0xu0 = AlphabeticalDigits.from("tr!xu!");
    const tr0kzn = AlphabeticalDigits.from("tr!kzn");

    // Act
    const result = tr0xu0.compare(tr0kzn);

    // Assert
    expect(result, '"tr!xu!" > "tr!kzn"').to.equal("greater");
  }

  @test("Should return 'equal' when the left value is equal to the right value", "compare")
  compare_left_0ufad_right_ufad() {
    // Arrange
    const _0ufad = AlphabeticalDigits.from("!ufad");
    const _ufad = AlphabeticalDigits.from("ufad");

    // Act
    const result = _0ufad.compare(_ufad);

    // Assert
    expect(result, '"!ufad"  "ufad"').to.equal("equal");
  }

  @test("Should return 'less' when the left value is smaller than the right value", "compare")
  compare_left_plkg_right_plkga() {
    // Arrange
    const plkg = AlphabeticalDigits.from("plkg");
    const plkga = AlphabeticalDigits.from("plkga");

    // Act
    const result = plkg.compare(plkga);

    // Assert
    expect(result, '"plkg" ~ "plkga"').to.equal("less");
  }
  //#endregion
}

export default NumberTest;
