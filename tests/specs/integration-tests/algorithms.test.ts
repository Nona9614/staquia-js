// Chai
import { expect } from "chai";
// Structures
import Spec from "../../structures/test-spec.js";
// Mocks
import AlphabeticalSystem from "../../mocks/alphabetical-number-system.js";
import Position from "../../../src/entities/position.js";
import inject from "../../inject.js";
// Decorators
import setup from "../../decorators/setup.decorator.js";
import test from "../../decorators/test.decorator.js";
// Aggregates
import algorithms from "../../../src/aggregates/algorithms/index.js";
// Implementations
import AlphabeticalDigits from "../../mocks/alphabetical-digits.js";
import ICrafter from "../../../src/interfaces/crafter.js";
import assert from "node:assert";

class AlgorithmsTest extends Spec {
  private readonly system = new AlphabeticalSystem();
  private readonly crafter: ICrafter = {
    number: AlphabeticalDigits,
    position: Position,
  };

  constructor() {
    super("algorithms", "Integration Test");
  }

  @setup
  init() {}

  //#region `after` Tests
  @test("Should go from 'aaa' to 'aab'", "after")
  after_number_aaa(): void {
    // Arrange
    const number = AlphabeticalDigits.from("aaa");
    const round = false;
    const after = inject(algorithms.after, this.system, algorithms);

    // Act
    const result: AlphabeticalDigits = after(number, round);

    // Assert
    expect(result.lowerBound).to.equal(0);
    expect(result.upperBound).to.equal(2);
    expect(result.toString()).to.equal("aab");
  }

  @test("Should go (base * n + 1) place after when starts with the last character in set", "after")
  after_number_az() {
    // Arrange
    const number = AlphabeticalDigits.from("az");
    const round = false;
    const after = inject(algorithms.after, this.system, algorithms);

    // Act
    const result: AlphabeticalDigits = after(number, round);

    // Assert
    expect(result.lowerBound).to.equal(0);
    expect(result.upperBound).to.equal(1);
    expect(result.toString()).to.equal("b!");
  }

  @test("Should resolve multiple overflows", "after")
  after_number_azzz() {
    // Arrange
    const number = AlphabeticalDigits.from("azzz");
    const round = false;
    const after = inject(algorithms.after, this.system, algorithms);

    // Act
    const result: AlphabeticalDigits = after(number, round);

    // Assert
    expect(result.lowerBound).to.equal(0);
    expect(result.upperBound).to.equal(3);
    expect(result.toString()).to.equal("b!!!");
  }
  //#endregion

  //#region `before` Tests
  @test("Should go one value before", "before")
  before_number_z() {
    // Arrange
    const number = AlphabeticalDigits.from("z");
    const round = false;
    const before = inject(algorithms.before, this.system, algorithms);

    // Act
    const result: AlphabeticalDigits = before(number, round);

    // Assert
    expect(result.lowerBound).to.equal(0);
    expect(result.upperBound).to.equal(0);
    expect(result.toString()).to.equal("y");
  }

  @test("Should go (base * n - 1) place before when starts with 'zero'", "before")
  before_number_z0() {
    // Arrange
    const number = AlphabeticalDigits.from("z!");
    const round = false;
    const before = inject(algorithms.before, this.system, algorithms);

    // Act
    const result: AlphabeticalDigits = before(number, round);

    // Assert
    expect(result.lowerBound).to.equal(0);
    expect(result.upperBound).to.equal(1);
    expect(result.toString()).to.equal("yz");
  }
  //#endregion

  //#region `between` Tests
  @test("Should resolve values that may cause overflow after substraction", "between")
  between_number_yz_and_number_za() {
    // Arrange
    const yz = AlphabeticalDigits.from("yz");
    const za = AlphabeticalDigits.from("za");
    const z0 = "z!";
    const between = inject(algorithms.between, this.system, algorithms, { number: AlphabeticalDigits });

    // Act
    const result: AlphabeticalDigits = between(yz, za, false);

    // Assert
    expect(result.lowerBound, '"lowerBound"').to.equal(0);
    expect(result.upperBound, '"upperBound"').to.equal(1);
    expect(result.toString(), '"number"').to.equal(z0);
  }

  @test("Should resolve hidden leading zero plus values that causes carry on substraction", "between")
  between_number_akz_and_number_abyn() {
    // Arrange
    const akz = AlphabeticalDigits.from("akz");
    const abyn = AlphabeticalDigits.from("abyn");
    const _0ort = "!ort";
    const between = inject(algorithms.between, this.system, algorithms, { number: AlphabeticalDigits });

    // Act
    const result: AlphabeticalDigits = between(akz, abyn, false);

    // Assert
    expect(result.lowerBound, '"lowerBound"').to.equal(0);
    expect(result.upperBound, '"upperBound"').to.equal(3);
    expect(result.toString(), '"number"').to.equal(_0ort);
  }

  @test("Should evaluate considering leading zeroes and resolve no room", "between")
  between_number_00abz_and_number_abzaa() {
    // Arrange
    const _00abz = AlphabeticalDigits.from("!!abz");
    const abzaa = AlphabeticalDigits.from("abzaa");
    const _0o0b0 = "!o!b!";
    const between = inject(algorithms.between, this.system, algorithms, { number: AlphabeticalDigits });

    // Act
    const result: AlphabeticalDigits = between(_00abz, abzaa, false);

    // Assert
    expect(result.lowerBound, '"lowerBound"').to.equal(0);
    expect(result.upperBound, '"upperBound"').to.equal(4);
    expect(result.toString(), '"number"').to.equal(_0o0b0);
  }

  @test("Should resolve a coersive no room case and add missing leading zeroes", "between")
  between_number_abyzz_and_number_abz_round() {
    // Arrange
    const abyzz = AlphabeticalDigits.from("abyzz");
    const abz = AlphabeticalDigits.from("abz");
    const _0o0am = "!o!am";
    const between = inject(algorithms.between, this.system, algorithms, { number: AlphabeticalDigits });

    // Act
    const result: AlphabeticalDigits = between(abyzz, abz, true);

    // Assert
    expect(result.lowerBound, '"lowerBound"').to.equal(0);
    expect(result.upperBound, '"upperBound"').to.equal(4);
    expect(result.toString(), '"number"').to.equal(_0o0am);
  }

  @test("Should resolve hidden leading zero", "between")
  between_number_r_and_number_ri() {
    // Arrange
    const r = AlphabeticalDigits.from("r");
    const ri = AlphabeticalDigits.from("ri");
    const imm = "imm";
    const between = inject(algorithms.between, this.system, algorithms, { number: AlphabeticalDigits });

    // Act
    const result: AlphabeticalDigits = between(r, ri, false);

    // Assert
    expect(result.lowerBound, '"lowerBound"').to.equal(-1);
    expect(result.upperBound, '"upperBound"').to.equal(1);
    expect(result.toString(), '"number"').to.equal(imm);
  }

  @test("Should get the exact middle point from the system", "between")
  between_number_a_and_number_z() {
    // Arrange
    const a = AlphabeticalDigits.from("a");
    const z = AlphabeticalDigits.from("z");
    const mm = "mm";
    const between = inject(algorithms.between, this.system, algorithms, { number: AlphabeticalDigits });

    // Act
    const result: AlphabeticalDigits = between(a, z, false);

    // Assert
    expect(result.lowerBound, '"lowerBound"').to.equal(-1);
    expect(result.upperBound, '"upperBound"').to.equal(0);
    expect(result.toString(), '"number"').to.equal(mm);
  }

  @test("Should get the middle value from the system rounded", "between")
  between_number_a_and_number_z_round() {
    // Arrange
    const a = AlphabeticalDigits.from("a");
    const z = AlphabeticalDigits.from("z");
    const n = "n";
    const between = inject(algorithms.between, this.system, algorithms, { number: AlphabeticalDigits });

    // Act
    const result: AlphabeticalDigits = between(a, z, true);

    // Assert
    expect(result.lowerBound, '"lowerBound"').to.equal(0);
    expect(result.upperBound, '"upperBound"').to.equal(0);
    expect(result.toString(), '"number"').to.equal(n);
  }

  @test("Should get the middle value from the system rounded", "between")
  between_number_a_and_number_c_round() {
    // Arrange
    const a = AlphabeticalDigits.from("a");
    const c = AlphabeticalDigits.from("c");
    const b = "b";
    const between = inject(algorithms.between, this.system, algorithms, { number: AlphabeticalDigits });

    // Act
    const result: AlphabeticalDigits = between(a, c, true);

    // Assert
    expect(result.lowerBound, '"lowerBound"').to.equal(0);
    expect(result.upperBound, '"upperBound"').to.equal(0);
    expect(result.toString(), '"number"').to.equal(b);
  }
  //#endregion

  //#region `diverge` Tests
  @test("Should handle complex numbers", "diverge")
  diverge_number_0xca_and_number_0xaa() {
    // Arrange
    const _0xca = AlphabeticalDigits.from("!xca");
    const _0xaa = AlphabeticalDigits.from("!xaa");
    const _0xb = "!xb";
    const diverge = inject(algorithms.diverge, this.system, algorithms, { number: AlphabeticalDigits });

    // Act
    const result: AlphabeticalDigits = diverge(_0xca, _0xaa);

    // Assert
    expect(result.lowerBound, '"lowerBound"').to.equal(0);
    expect(result.upperBound, '"upperBound"').to.equal(2);
    expect(result.toString(), '"number"').to.equal(_0xb);
  }

  @test("Should avoid overlap when there is no room and is in the limit of the system", "diverge")
  diverge_number_yz_and_number_zzzy() {
    // Arrange
    const yz = AlphabeticalDigits.from("yz");
    const zzzy = AlphabeticalDigits.from("zzzy");
    const zl = "zl";
    const diverge = inject(algorithms.diverge, this.system, algorithms, { number: AlphabeticalDigits });

    // Act
    const result: AlphabeticalDigits = diverge(yz, zzzy);

    // Assert
    expect(result.lowerBound, '"lowerBound"').to.equal(0);
    expect(result.upperBound, '"upperBound"').to.equal(1);
    expect(result.toString(), '"number"').to.equal(zl);
  }

  @test("Should get the middle character ignoring the offset", "diverge")
  diverge_number_a_and_number_zz() {
    // Arrange
    const a = AlphabeticalDigits.from("a");
    const zz = AlphabeticalDigits.from("zz");
    const n = "n";
    const diverge = inject(algorithms.diverge, this.system, algorithms, { number: AlphabeticalDigits });

    // Act
    const result: AlphabeticalDigits = diverge(a, zz);

    // Assert
    expect(result.lowerBound, '"lowerBound"').to.equal(0);
    expect(result.upperBound, '"upperBound"').to.equal(0);
    expect(result.toString(), '"number"').to.equal(n);
  }

  @test("Should ignore and concat again leading zeroes", "diverge")
  diverge_number_00a_and_number_00z() {
    // Arrange
    const _00a = AlphabeticalDigits.from("!!a");
    const _00z = AlphabeticalDigits.from("!!z");
    const _00n = "!!n";
    const diverge = inject(algorithms.diverge, this.system, algorithms, { number: AlphabeticalDigits });

    // Act
    const result: AlphabeticalDigits = diverge(_00a, _00z);

    // Assert
    expect(result.lowerBound, '"lowerBound"').to.equal(0);
    expect(result.upperBound, '"upperBound"').to.equal(2);
    expect(result.toString(), '"number"').to.equal(_00n);
  }

  @test("Should extend itself when there is no room", "diverge")
  diverge_number_az_and_number_b0() {
    // Arrange
    const az = AlphabeticalDigits.from("az");
    const b0 = AlphabeticalDigits.from("b!");
    const azm = "azm";
    const diverge = inject(algorithms.diverge, this.system, algorithms, { number: AlphabeticalDigits });

    // Act
    const result: AlphabeticalDigits = diverge(az, b0);

    // Assert
    expect(result.lowerBound, '"lowerBound"').to.equal(-1);
    expect(result.upperBound, '"upperBound"').to.equal(1);
    expect(result.toString(), '"number"').to.equal(azm);
  }

  @test("Should order the values before evaluation", "diverge")
  diverge_number_ng_and_number_n() {
    // Arrange
    const ng = AlphabeticalDigits.from("ng");
    const n = AlphabeticalDigits.from("n");
    const nd = "nd";
    const diverge = inject(algorithms.diverge, this.system, algorithms, { number: AlphabeticalDigits });

    // Act
    const result: AlphabeticalDigits = diverge(ng, n);

    // Assert
    expect(result.lowerBound, '"lowerBound"').to.equal(0);
    expect(result.upperBound, '"upperBound"').to.equal(1);
    expect(result.toString(), '"number"').to.equal(nd);
  }

  @test("Should ignore repeated values then concatenate them again, work against zero space and ignore extra values", "diverge")
  diverge_number_abba_and_number_abccc() {
    // Arrange
    const abba = AlphabeticalDigits.from("abba");
    const abccc = AlphabeticalDigits.from("abccc");
    const abbo = "abbo";
    const diverge = inject(algorithms.diverge, this.system, algorithms, { number: AlphabeticalDigits });

    // Act
    const result: AlphabeticalDigits = diverge(abba, abccc);

    // Assert
    expect(result.lowerBound, '"lowerBound"').to.equal(0);
    expect(result.upperBound, '"upperBound"').to.equal(3);
    expect(result.toString(), '"number"').to.equal(abbo);
  }

  @test("Should ignore repeated values then concatenate them again and extends because zero space", "diverge")
  diverge_number_nnnn_and_number_nnno() {
    // Arrange
    const nnnn = AlphabeticalDigits.from("nnnn");
    const nnno = AlphabeticalDigits.from("nnno");
    const nnnnm = "nnnnm";
    const diverge = inject(algorithms.diverge, this.system, algorithms, { number: AlphabeticalDigits });

    // Act
    const result: AlphabeticalDigits = diverge(nnnn, nnno);

    // Assert
    expect(result.lowerBound, '"lowerBound"').to.equal(-1);
    expect(result.upperBound, '"upperBound"').to.equal(3);
    expect(result.toString(), '"number"').to.equal(nnnnm);
  }

  @test("Should get the value before the middle value from the system", "diverge")
  diverge_number_0_and_number_z() {
    // Arrange
    const _0 = AlphabeticalDigits.from("!");
    const z = AlphabeticalDigits.from("z");
    const m = "m";
    const diverge = inject(algorithms.diverge, this.system, algorithms, { number: AlphabeticalDigits });

    // Act
    const result: AlphabeticalDigits = diverge(_0, z);

    // Assert
    expect(result.lowerBound, '"lowerBound"').to.equal(0);
    expect(result.upperBound, '"upperBound"').to.equal(0);
    expect(result.toString(), '"number"').to.equal(m);
  }

  @test("Should get the middle value from the system", "diverge")
  diverge_number_a_and_number_z() {
    // Arrange
    const a = AlphabeticalDigits.from("a");
    const z = AlphabeticalDigits.from("z");
    const n = "n";
    const diverge = inject(algorithms.diverge, this.system, algorithms, { number: AlphabeticalDigits });

    // Act
    const result: AlphabeticalDigits = diverge(a, z);

    // Assert
    expect(result.lowerBound, '"lowerBound"').to.equal(0);
    expect(result.upperBound, '"upperBound"').to.equal(0);
    expect(result.toString(), '"number"').to.equal(n);
  }
  //#endregion

  //#region `clean` Tests
  @test("Should clean the extra 'zz' values", "clean")
  clean_before_yz_value_zlzz_after_zzzy() {
    // Arrange
    const yz = AlphabeticalDigits.from("yz");
    const zzzy = AlphabeticalDigits.from("zzzy");
    const zlzz = AlphabeticalDigits.from("zlzz");
    const __zl = "zl";
    const clean = inject(algorithms.clean, this.system, algorithms, { number: AlphabeticalDigits });

    // Act
    const result: AlphabeticalDigits = clean(zlzz, yz, zzzy);

    // Assert
    expect(result.lowerBound, '"lowerBound"').to.equal(0);
    expect(result.upperBound, '"upperBound"').to.equal(1);
    expect(result.toString(), '"number"').to.equal(__zl);
  }

  @test("Should clean the extra 'A' values", "clean")
  clean_before_0xaa_value_0xba_after_0xca() {
    // Arrange
    const _0xaa = AlphabeticalDigits.from("!xaa");
    const _0xca = AlphabeticalDigits.from("!xca");
    const _0xba = AlphabeticalDigits.from("!xba");
    const __0xb = "!xb";
    const clean = inject(algorithms.clean, this.system, algorithms, { number: AlphabeticalDigits });

    // Act
    const result: AlphabeticalDigits = clean(_0xba, _0xaa, _0xca);

    // Assert
    expect(result.lowerBound, '"lowerBound"').to.equal(0);
    expect(result.upperBound, '"upperBound"').to.equal(2);
    expect(result.toString(), '"number"').to.equal(__0xb);
  }

  @test("Should not clean the value as there is no space", "clean")
  clean_before_az_value_azm_after_b0() {
    // Arrange
    const az = AlphabeticalDigits.from("az");
    const b0 = AlphabeticalDigits.from("b!");
    const azm = AlphabeticalDigits.from("azm");
    const __azm = "azm";
    const clean = inject(algorithms.clean, this.system, algorithms, { number: AlphabeticalDigits });

    // Act
    const result: AlphabeticalDigits = clean(azm, az, b0);

    // Assert
    expect(result.lowerBound, '"lowerBound"').to.equal(0);
    expect(result.upperBound, '"upperBound"').to.equal(2);
    expect(result.toString(), '"number"').to.equal(__azm);
  }
  //#endregion

  //#region `substract` Tests
  @test("Should resolve when the left operand is smaller and result in 1", "substract")
  substract_mmmm_from_mmmn() {
    // Arrange
    const left = AlphabeticalDigits.from("mmmm");
    const right = AlphabeticalDigits.from("mmmn");
    const substract = inject(algorithms.substract, this.system, this.crafter);

    // Act
    const result = substract(left, right);

    // // Assert
    expect(result.upperBound, '"upperBound"').to.equal(0);
    expect(result.lowerBound, '"lowerBound"').to.equal(0);
    assert.equal(result.isNegative, true);
    expect(result.toString(), '"number"').to.equal("a");
  }
  //#endregion
}

export default AlgorithmsTest;
