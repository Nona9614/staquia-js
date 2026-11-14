// Node JS
import assert from "node:assert";
// Structures
import Spec from "../../structures/test-spec.js";
import Staquia from "../../../src/entities/staquia.js";
// Errors
import ThresholdReachedError from "../../../src/errors/threshold-reached-error.js";
import OverflowError from "../../../src/errors/overflow-error.js";
import SystemMismatchError from "../../../src/errors/system-mismatch-error.js";
import InvalidCharacterError from "../../../src/errors/invalid-character-error.js";
// Entities
import Position from "../../../src/entities/position.js";
// Decorators
import setup from "../../decorators/setup.decorator.js";
import test from "../../decorators/test.decorator.js";
// Types
import type { IPositionResult } from "../../../src/results/position-result.js";
// Interfaces
import IPosition from "../../../src/interfaces/position.js";

/** Unwraps a successful position result or throws the contained error. */
const assert_ok = (result: IPositionResult): IPosition => {
  if (!result.ok) throw result.error;
  return result.value;
};

/**
 * Verifies that `left` is strictly before `right` both as strings (what a database sorts)
 * and through `compare` (what the library uses internally).
 */
const assert_before = (left: IPosition, right: IPosition) => {
  const l = left.toString();
  const r = right.toString();
  assert.ok(l < r, `The position string '${l}' must sort before '${r}'.`);
  assert.equal(left.compare(right), "less", `The position '${l}' must compare as less than '${r}'.`);
  assert.equal(right.compare(left), "greater", `The position '${r}' must compare as greater than '${l}'.`);
};

/**
 * Integration tests of the public `Staquia` API.
 *
 * The library contract is that positions sorted as plain strings keep the same order
 * as the list, so every generated position must respect the string order and `compare`.
 */
export default class StaquiaTests extends Spec {
  #system = Staquia.create("!", "a", "z", 4, 12, 0.15);

  constructor() {
    super("Staquia", "Integration Test");
  }

  @setup
  init() {}

  // ---------------------------------------------------------------------------
  // Forge
  // ---------------------------------------------------------------------------

  @test("Should pad a 3 character string to the right with zeroes.", "forge")
  staquia_forge_pads_three_characters() {
    assert.equal(assert_ok(this.#system.forge("abc")).toString(), "abc!!");
  }

  @test("Should pad a 2 character string to the right with zeroes.", "forge")
  staquia_forge_pads_two_characters() {
    assert.equal(assert_ok(this.#system.forge("xy")).toString(), "xy!!!");
  }

  @test("Should pad a single character string to the right with zeroes.", "forge")
  staquia_forge_pads_one_character() {
    assert.equal(assert_ok(this.#system.forge("b")).toString(), "b!!!!");
  }

  @test("Should keep the string order of the forged strings.", "forge")
  staquia_forge_keeps_order() {
    const strings = ["abc", "abcs", "b", "bbbb", "mmmm!m", "mmmma", "xy", "zzzz"];
    const positions = strings.map((s) => assert_ok(this.#system.forge(s)));
    for (let i = 1; i < positions.length; i++) assert_before(positions[i - 1]!, positions[i]!);
  }

  @test("Should forge back the same position from its string representation.", "forge")
  staquia_forge_round_trip() {
    const start = assert_ok(this.#system.start());
    const next = assert_ok(this.#system.next(start));
    const samples = [start, next, assert_ok(this.#system.previous(start)), assert_ok(this.#system.core(start, next))];
    for (const position of samples) {
      const forged = assert_ok(this.#system.forge(position.toString()));
      assert.equal(forged.toString(), position.toString());
      assert.equal(forged.compare(position), "equal", `The forged '${forged}' must be equal to '${position}'.`);
    }
  }

  /** Asserts that forging the string fails at the given index with an `InvalidCharacterError`. */
  #assert_invalid(string: string, index: number) {
    const result = this.#system.forge(string);
    if (result.ok) assert.fail(`forge('${string}') must fail but returned '${result.value}'.`);
    assert.ok(result.error instanceof InvalidCharacterError, `forge('${string}') must fail with an 'InvalidCharacterError' but got '${result.error}'.`);
    assert.equal(result.error.string, string);
    assert.equal(result.error.index, index, `forge('${string}') must fail at the index ${index}.`);
  }

  @test("Should reject characters that are not digits of the system.", "forge")
  staquia_forge_rejects_foreign_characters() {
    this.#assert_invalid("¼¼¼¼¿!", 0); // From another system
    this.#assert_invalid("abcD", 3); // Uppercase is below 'a'
    this.#assert_invalid("ab{c", 2); // Right after the last character 'z'
    this.#assert_invalid("mmmm!m😀", 6); // Outside the Basic Multilingual Plane
  }

  @test("Should reject characters between the zero and the first character.", "forge")
  staquia_forge_rejects_gap_characters() {
    // The zero is '!' and the first character is 'a', so '"' to '`' are not digits
    this.#assert_invalid('a"aa', 1);
    this.#assert_invalid("aa`a", 2);
    this.#assert_invalid("aaa0", 3);
  }

  @test("Should accept the zero, the first and the last characters.", "forge")
  staquia_forge_accepts_bounds() {
    assert.equal(assert_ok(this.#system.forge("!azz!a")).toString(), "!azz!a");
  }

  // ---------------------------------------------------------------------------
  // Compare
  // ---------------------------------------------------------------------------

  @test("Should compare positions with different z lengths by their string order.", "compare")
  staquia_compare_different_z_lengths() {
    const forge = (s: string) => assert_ok(this.#system.forge(s));
    // A longer `z` must not be considered bigger just for having more digits.
    assert_before(forge("mmmm!m"), forge("mmmma"));
    assert_before(forge("mmmm!"), forge("mmmm!m"));
    assert_before(forge("mmmma"), forge("mmmmaa"));
    assert_before(forge("mmmm!z"), forge("mmmma!"));
  }

  @test("Should consider trailing zeroes as equal positions.", "compare")
  staquia_compare_trailing_zeroes() {
    const left = assert_ok(this.#system.forge("mmmma"));
    const right = assert_ok(this.#system.forge("mmmma!!"));
    assert.equal(left.compare(right), "equal");
  }

  // ---------------------------------------------------------------------------
  // Next & Previous
  // ---------------------------------------------------------------------------

  @test("Should generate strictly increasing positions with next.", "next & previous")
  staquia_next_sequence() {
    let position = assert_ok(this.#system.start());
    for (let i = 0; i < 200; i++) {
      const next = assert_ok(this.#system.next(position));
      assert_before(position, next);
      position = next;
    }
  }

  @test("Should generate strictly decreasing positions with previous.", "next & previous")
  staquia_previous_sequence() {
    let position = assert_ok(this.#system.start());
    for (let i = 0; i < 200; i++) {
      const previous = assert_ok(this.#system.previous(position));
      assert_before(previous, position);
      position = previous;
    }
  }

  @test("Should return to the same position when going next and then previous.", "next & previous")
  staquia_next_previous_inverse() {
    const start = assert_ok(this.#system.start());
    const back = assert_ok(this.#system.previous(assert_ok(this.#system.next(start))));
    assert.equal(back.compare(start), "equal");
    const forth = assert_ok(this.#system.next(assert_ok(this.#system.previous(start))));
    assert.equal(forth.compare(start), "equal");
  }

  // ---------------------------------------------------------------------------
  // N edges
  // ---------------------------------------------------------------------------

  /** Asserts that the result is an overflow error, never a wrapped position. */
  #assert_overflow(result: IPositionResult, label: string) {
    if (result.ok) assert.fail(`${label} must fail with an overflow but returned '${result.value}'.`);
    assert.ok(result.error instanceof OverflowError, `${label} must fail with an 'OverflowError' but got '${result.error}'.`);
  }

  @test("Should keep the leading zeroes of N when going next.", "n edges")
  staquia_next_keeps_leading_zeroes() {
    const next = (s: string) => assert_ok(this.#system.next(assert_ok(this.#system.forge(s)))).toString();
    assert.equal(next("!!!a"), "!!!b!");
    assert.equal(next("!!ab"), "!!ac!");
    assert.equal(next("!!!z"), "!!a!!");
    assert.equal(next("!abc"), "!abd!");
  }

  @test("Should keep the leading zeroes of N when going previous.", "n edges")
  staquia_previous_keeps_leading_zeroes() {
    const previous = (s: string) => assert_ok(this.#system.previous(assert_ok(this.#system.forge(s)))).toString();
    assert.equal(previous("!!ab"), "!!aa!");
    assert.equal(previous("!!a!"), "!!!z!");
    assert.equal(previous("!!!b"), "!!!a!");
    assert.equal(previous("a!!!"), "!zzz!");
  }

  @test("Should reach the last and first values of N without errors.", "n edges")
  staquia_n_reaches_limits() {
    assert.equal(assert_ok(this.#system.next(assert_ok(this.#system.forge("zzzy")))).toString(), "zzzz!");
    assert.equal(assert_ok(this.#system.previous(assert_ok(this.#system.forge("!!!a")))).toString(), "!!!!!");
  }

  @test("Should fail with an overflow when going next from the last value of N.", "n edges")
  staquia_next_overflow() {
    this.#assert_overflow(this.#system.next(assert_ok(this.#system.forge("zzzz"))), "next('zzzz')");
    this.#assert_overflow(this.#system.next(assert_ok(this.#system.forge("zzzzm"))), "next('zzzzm')");
  }

  @test("Should fail with an overflow when going previous from the first value of N.", "n edges")
  staquia_previous_overflow() {
    this.#assert_overflow(this.#system.previous(assert_ok(this.#system.forge("!!!!"))), "previous('!!!!')");
    this.#assert_overflow(this.#system.previous(assert_ok(this.#system.forge("!!!!a"))), "previous('!!!!a')");
  }

  @test("Should never wrap around when walking next until the end of N.", "n edges")
  staquia_next_walk_to_end() {
    let position = assert_ok(this.#system.forge("zzyr"));
    for (let i = 0; i < 100; i++) {
      const result = this.#system.next(position);
      if (!result.ok) {
        this.#assert_overflow(result, `next('${position}')`);
        assert.equal(position.toString(), "zzzz!", "The overflow must happen only at the last value of N.");
        return;
      }
      assert_before(position, result.value);
      position = result.value;
    }
    assert.fail("The end of N was never reached.");
  }

  @test("Should never wrap around when walking previous until the start of N.", "n edges")
  staquia_previous_walk_to_start() {
    let position = assert_ok(this.#system.forge("!!ah"));
    for (let i = 0; i < 100; i++) {
      const result = this.#system.previous(position);
      if (!result.ok) {
        this.#assert_overflow(result, `previous('${position}')`);
        assert.equal(position.toString(), "!!!!!", "The overflow must happen only at the first value of N.");
        return;
      }
      assert_before(result.value, position);
      position = result.value;
    }
    assert.fail("The start of N was never reached.");
  }

  // ---------------------------------------------------------------------------
  // Core
  // ---------------------------------------------------------------------------

  @test("Should generate a position strictly between two adjacent positions.", "core")
  staquia_core_between_adjacent() {
    const start = assert_ok(this.#system.start());
    const next = assert_ok(this.#system.next(start));
    const core = assert_ok(this.#system.core(start, next));
    assert_before(start, core);
    assert_before(core, next);
  }

  /**
   * Keeps inserting into the same gap, narrowing it from one side, until the system refuses
   * because the threshold or overflow is reached. Every generated position must be strictly
   * between its bounds, and the system must fail with an error instead of a wrong position.
   */
  #narrow(side: "left" | "right") {
    let left = assert_ok(this.#system.start());
    let right = assert_ok(this.#system.next(left));
    for (let i = 0; i < 500; i++) {
      const result = this.#system.core(left, right);
      if (!result.ok) {
        assert.ok(
          result.error instanceof ThresholdReachedError || result.error instanceof OverflowError,
          `Expected a threshold or overflow error but got '${result.error}'.`,
        );
        assert.ok(i > 0, "The system must allow at least one insertion between adjacent positions.");
        return;
      }
      assert_before(left, result.value);
      assert_before(result.value, right);
      if (side === "left") right = result.value;
      else left = result.value;
    }
    assert.fail("The gap was narrowed 500 times without reaching the threshold.");
  }

  @test("Should keep the order while narrowing a gap from the right until the threshold.", "core")
  staquia_core_narrow_from_right() {
    this.#narrow("left");
  }

  @test("Should keep the order while narrowing a gap from the left until the threshold.", "core")
  staquia_core_narrow_from_left() {
    this.#narrow("right");
  }

  @test("Should return the error of a failed result passed as an argument.", "core")
  staquia_core_propagates_errors() {
    const start = assert_ok(this.#system.start());
    const failed = this.#system.next(assert_ok(this.#system.forge("zzzz")));
    assert.ok(!failed.ok, "The setup must produce a failed result.");

    const asNext = this.#system.core(start, failed);
    assert.ok(!asNext.ok, "A failed next argument must fail the core.");
    assert.equal(asNext.error, failed.error);

    const asPrevious = this.#system.core(failed, start);
    assert.ok(!asPrevious.ok, "A failed previous argument must fail the core.");
    assert.equal(asPrevious.error, failed.error);
  }

  @test("Should generate the same position regardless of the arguments order.", "core")
  staquia_core_symmetric() {
    const start = assert_ok(this.#system.start());
    const next = assert_ok(this.#system.next(assert_ok(this.#system.next(start))));
    const a = assert_ok(this.#system.core(start, next));
    const b = assert_ok(this.#system.core(next, start));
    assert.equal(a.toString(), b.toString());
  }

  // ---------------------------------------------------------------------------
  // Systems
  // ---------------------------------------------------------------------------

  /** Verifies that the system positions use only its characters and round-trip through `forge`. */
  #assert_system(system: Staquia, characters: RegExp, label: string) {
    const start = assert_ok(system.start());
    const samples = [start, assert_ok(system.next(start)), assert_ok(system.core(start, assert_ok(system.next(start))))];
    for (const position of samples) {
      const string = position.toString();
      assert.match(string, characters, `${label}: the position '${string}' uses characters from another system.`);
      const forged = assert_ok(system.forge(string));
      assert.equal(forged.toString(), string, `${label}: '${string}' does not round-trip.`);
      assert.equal(forged.compare(position), "equal", `${label}: '${string}' does not round-trip.`);
    }
  }

  @test("Should print each system positions with its own characters.", "systems")
  staquia_systems_independent() {
    const alphabet = Staquia.create("!", "a", "z", 4, 12, 0.15);
    const digits = Staquia.create("#", "0", "9", 4, 12, 0.15);
    const before = assert_ok(alphabet.start()).toString();

    this.#assert_system(alphabet, /^[!a-z]+$/, "alphabet");
    this.#assert_system(digits, /^[#0-9]+$/, "digits");

    // Creating more systems after must not change the previous ones
    Staquia.create("~", "A", "Z", 3, 8, 0.15);
    Staquia.default();
    this.#assert_system(alphabet, /^[!a-z]+$/, "alphabet");
    this.#assert_system(digits, /^[#0-9]+$/, "digits");
    assert.equal(assert_ok(alphabet.start()).toString(), before);
  }

  @test("Should keep printing an existing position the same after creating other systems.", "systems")
  staquia_systems_existing_position() {
    const alphabet = Staquia.create("!", "a", "z", 4, 12, 0.15);
    const position = assert_ok(alphabet.forge("abcd"));
    Staquia.default();
    assert.equal(position.toString(), "abcd!");
    assert.equal(`${position}`, "abcd!");
  }

  @test("Should not modify the shared Position class.", "systems")
  staquia_systems_base_untouched() {
    Staquia.create("!", "a", "z", 4, 12, 0.15);
    assert.ok(!Object.prototype.hasOwnProperty.call(Position.prototype, "toString"), "Position.prototype must not own a toString.");
  }

  @test("Should create positions that are instances of Position.", "systems")
  staquia_systems_instance_of() {
    const position = assert_ok(this.#system.start());
    assert.ok(position instanceof Position);
    assert.equal(position.constructor.name, "Position");
    assert.ok(!Object.keys(position).includes("toString"), "toString must not be an own enumerable field.");
  }

  @test("Should support a custom position class shared by many systems without modifying it.", "systems")
  staquia_systems_custom_position() {
    class CustomPosition extends Position {
      custom() {
        return "custom";
      }
    }
    const alphabet = Staquia.create("!", "a", "z", 4, 12, 0.15, { position: CustomPosition });
    const digits = Staquia.create("#", "0", "9", 4, 12, 0.15, { position: CustomPosition });

    this.#assert_system(alphabet, /^[!a-z]+$/, "alphabet");
    this.#assert_system(digits, /^[#0-9]+$/, "digits");

    const position = assert_ok(alphabet.start());
    assert.ok(position instanceof CustomPosition);
    assert.ok(position instanceof Position);
    assert.equal((position as CustomPosition).custom(), "custom");
    assert.equal(position.constructor.name, "CustomPosition");
    assert.ok(!Object.prototype.hasOwnProperty.call(CustomPosition.prototype, "toString"), "The custom class must not be modified.");
  }

  @test("Should accept positions from another system with the same configuration.", "systems")
  staquia_systems_same_configuration() {
    const first = Staquia.create("!", "a", "z", 4, 12, 0.15);
    const second = Staquia.create("!", "a", "z", 4, 12, 0.15);
    const start = assert_ok(first.start());
    assert.equal(assert_ok(second.next(start)).toString(), "mmmn!");
    assert.equal(assert_ok(second.previous(start)).toString(), "mmml!");
    assert_ok(second.core(start, assert_ok(second.next(start))));
    // The default system is the same configuration every time it is created
    assert_ok(Staquia.default().next(assert_ok(Staquia.default().start())));
  }

  /** Asserts that the result failed because of a position from another system. */
  #assert_mismatch(result: IPositionResult, label: string) {
    if (result.ok) assert.fail(`${label} must fail with a system mismatch but returned '${result.value}'.`);
    assert.ok(result.error instanceof SystemMismatchError, `${label} must fail with a 'SystemMismatchError' but got '${result.error}'.`);
  }

  @test("Should reject positions from a system with a different configuration.", "systems")
  staquia_systems_mismatch() {
    const alphabet = Staquia.create("!", "a", "z", 4, 12, 0.15);
    const digits = Staquia.create("#", "0", "9", 4, 12, 0.15);
    const longer = Staquia.create("!", "a", "z", 5, 12, 0.15);
    const own = assert_ok(alphabet.start());
    const foreign = assert_ok(digits.start());

    this.#assert_mismatch(alphabet.next(foreign), "next");
    this.#assert_mismatch(alphabet.previous(foreign), "previous");
    this.#assert_mismatch(alphabet.core(own, foreign), "core(own, foreign)");
    this.#assert_mismatch(alphabet.core(foreign, own), "core(foreign, own)");
    // The same characters with a different `n` length give the digits another meaning
    this.#assert_mismatch(longer.next(own), "next with a different n length");
  }

  // ---------------------------------------------------------------------------
  // Sync checks
  // ---------------------------------------------------------------------------

  @test("Should agree with the errors returned by forge at every length boundary.", "sync checks")
  staquia_sync_checks_agree_with_errors() {
    // ln = 4, lz = 12 → lmax = 16, fϰ = 0.15 → lϰ = 14
    for (const length of [13, 14, 15, 16, 17]) {
      const string = "mmmm" + "a".repeat(length - 4);
      const result = this.#system.forge(string);
      const position = result.ok ? result.value : (result.error as { position: IPosition }).position;
      const overflow = !result.ok && result.error instanceof OverflowError;
      const threshold = overflow || (!result.ok && result.error instanceof ThresholdReachedError);
      assert.equal(this.#system.hasOverflow(position), overflow, `hasOverflow with the length ${length}.`);
      assert.equal(this.#system.isThresholdReached(position), threshold, `isThresholdReached with the length ${length}.`);
    }
  }

  @test("Should not consider a position with the max length an overflow.", "sync checks")
  staquia_sync_checks_max_length() {
    const result = this.#system.forge("mmmm" + "a".repeat(12));
    assert.ok(!result.ok && result.error instanceof ThresholdReachedError, "A position with the length lmax only reaches the threshold.");
    assert.equal(this.#system.hasOverflow(result.error.position), false);
    assert.equal(this.#system.isThresholdReached(result.error.position), true);
  }
}
