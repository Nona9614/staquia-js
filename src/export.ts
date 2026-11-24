import Staquia from "./entities/staquia.js";
import Position from "./entities/position.js";
import Digits from "./entities/digits.js";
// Lists
import LexicalList from "./lists/lexical-list.js";
import LexicalItem from "./lists/lexical-item.js";
// Errors
import LexicalError from "./errors/lexical-error.js";
import OverflowError from "./errors/overflow-error.js";
import ThresholdReachedError from "./errors/threshold-reached-error.js";
import SystemMismatchError from "./errors/system-mismatch-error.js";
import InvalidCharacterError from "./errors/invalid-character-error.js";
// Results
import { Ok, Err } from "./result.js";

// Export types
import IAlgorithms from "./interfaces/algorithms.js";
import IClonable from "./interfaces/clonable.js";
import IComplexSystem from "./interfaces/complex-system.js";
import IComposer from "./interfaces/composer.js";
import ICrafter from "./interfaces/crafter.js";
import IDigits from "./interfaces/digits.js";
import ISignedDigits from "./interfaces/signed-digits.js";
import IForger from "./interfaces/forger.js";
import ILexicon from "./interfaces/lexicon.js";
import INumberSystem from "./interfaces/number-system.js";
import IOrdinal from "./interfaces/ordinal.js";
import IOverflowVerifier from "./interfaces/overflow-verifier.js";
import IPosition from "./interfaces/position.js";
import IUnicodes from "./interfaces/unicodes.js";
import type { IPositionResult } from "./results/position-result.js";
import type { IPositionError } from "./errors/position-error.js";
import type { LexicalErrorType } from "./errors/lexical-error.js";
import type { Result } from "./result.js";
import type { Item } from "./lists/lexical-item.js";
import IStaquiaOptions, { IPresetOptions } from "./interfaces/options.js";
import Ordering from "./unions/ordering.js";
import HalfMode from "./unions/half-mode.js";

export {
  IAlgorithms,
  IClonable,
  IComplexSystem,
  IComposer,
  ICrafter,
  IDigits,
  ISignedDigits,
  IForger,
  ILexicon,
  INumberSystem,
  IOrdinal,
  IOverflowVerifier,
  IPosition,
  IUnicodes,
  IPositionResult,
  IPositionError,
  LexicalErrorType,
  Result,
  Item,
  IStaquiaOptions,
  IPresetOptions,
  Ordering,
  HalfMode,
};

// Named exports
export { Digits, Position, LexicalList, LexicalItem, LexicalError, OverflowError, ThresholdReachedError, SystemMismatchError, InvalidCharacterError, Ok, Err };

// Exports staquia as default
export default Staquia;
