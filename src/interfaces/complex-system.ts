// Interfaces
import IAlgorithms from "./algorithms.js";
import IComposer from "./composer.js";
import ICrafter from "./crafter.js";
import IForger from "./forger.js";
import ILexicon from "./lexicon.js";
import INumberSystem from "./number-system.js";
import IUnicodes from "./unicodes.js";

/**
 * Internal: the complete number system behind a `Staquia` instance, with every capability
 * (configuration, algorithms, characters, classes, conversions and positions).
 */
export default interface IComplexSystem extends INumberSystem, IAlgorithms, ILexicon, IUnicodes, ICrafter, IComposer, IForger {}
