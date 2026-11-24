// Interfaces
import IComplexSystem from "../interfaces/complex-system.js";
import IPosition from "../interfaces/position.js";
import ICrafter from "../interfaces/crafter.js";
import IDigits from "../interfaces/digits.js";
// Aggregates
import {
  after,
  before,
  between,
  clean,
  compactNumbers,
  diverge,
  half,
  resolveOverflow,
  substract,
} from "../aggregates/algorithms/index.js";
import { getMiddle, getCharacter, getCode } from "../aggregates/lexicon/index.js";
import { reduce, raw, compose } from "../aggregates/composer/index.js";
import { _from, core, forge, next, previous, start } from "../aggregates/forger/index.js";
import getStringBuilder from "../aggregates/composer/get-string-builder.js";
import { derive } from "./position.js";

/**
 * Creates a number system using the composition pattern.
 */
class NumberSystem implements IComplexSystem {
  position!: new () => IPosition;
  number!: new () => IDigits;

  zeroUnicodeNumber!: number;
  firstUnicodeNumber!: number;
  lastUnicodeNumber!: number;

  ln!: number;
  lz!: number;
  lmax!: number;
  lϰ!: number;

  zero!: string;
  first!: string;

  last!: string;
  ϰ!: number;

  base!: number;
  set?: string;

  /**
   * @param set The characters when the digits are not a range: the zero followed by every digit, sorted by their
   * code. A set whose digits are consecutive is stored as that range (`zero`, `first` and `last` come from it).
   */
  static create(crafter: ICrafter, zero: string, first: string, last: string, n: number, z: number, ϰ: number, set?: string) {
    const system = new NumberSystem();
    system.number = crafter.number;

    if (set !== undefined) {
      zero = set[0]!;
      first = set[1]!;
      last = set[set.length - 1]!;
      let consecutive = true;
      for (let i = 2; i < set.length; i++) consecutive &&= set.charCodeAt(i) === set.charCodeAt(i - 1) + 1;
      if (!consecutive) system.set = set;
    }

    system.zero = zero;
    system.first = first;
    system.last = last;
    system.ϰ = ϰ;

    system.zeroUnicodeNumber = zero.charCodeAt(0);
    system.firstUnicodeNumber = first.charCodeAt(0);
    system.lastUnicodeNumber = last.charCodeAt(0);

    system.ln = n;
    system.lz = z;
    system.lmax = system.ln + system.lz;
    system.lϰ = Math.ceil((1 - ϰ) * system.lmax);
    system.base = system.set !== undefined ? system.set.length : system.lastUnicodeNumber - system.firstUnicodeNumber + 2;

    // Each system owns a subclass of the position class, so its string representation
    // is never shared with (or overwritten by) other systems, the signature allows
    // positions to be used by any system with the same configuration
    system.position = derive(
      crafter.position,
      getStringBuilder(
        reduce.bind({
          getCharacter: getCharacter.bind({
            zero: system.zero,
            firstUnicodeNumber: system.firstUnicodeNumber,
            set: system.set,
          }),
        }),
      ),
      // The digits meaning depends on the characters and the fixed `n` length
      JSON.stringify(system.set !== undefined ? [system.set, system.ln] : [system.zero, system.first, system.last, system.ln]),
    );

    return system;
  }

  //#region Algorithms
  after = after;
  before = before;
  between = between;
  diverge = diverge;
  clean = clean;
  compactNumbers = compactNumbers;
  half = half;
  substract = substract;
  resolveOverflow = resolveOverflow;
  //#endregion

  //#region Lexicon
  getMiddle = getMiddle;
  getCharacter = getCharacter;
  getCode = getCode;
  //#endregion

  //#region Composer
  compose = compose;
  raw = raw;
  reduce = reduce;
  //#endregion

  //#region Forger
  from = _from;
  forge = forge;
  start = start;
  core = core;
  next = next;
  previous = previous;
  //#endregion
}

export default NumberSystem;
