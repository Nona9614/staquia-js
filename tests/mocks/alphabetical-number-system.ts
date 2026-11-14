import INumberSystem from "../../src/interfaces/number-system";

export default class AlphabeticalSystem implements INumberSystem {
  zero = "!";
  first = "a";
  last = "z";
  lϰ = 14;
  ln = 4;
  lz = 12;
  lmax = 16;
  base = 27;
  ϰ = 0.15;
}
