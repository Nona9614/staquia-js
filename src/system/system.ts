import type { NumberSystem, NumberSystemSettings, RequiredRecursive } from "../types";

/**
 * Creates a number system
 */
function createNumberSystem({
  first,
  last,
  zero,
  ϰ,
  segments,
}: RequiredRecursive<NumberSystemSettings>): NumberSystem {
  
  const firstUnicodeNumber = first.charCodeAt(0);
  const lastUnicodeNumber = last.charCodeAt(0);
  const middleUnicodeNumber = Math.ceil(
    (firstUnicodeNumber + lastUnicodeNumber) / 2
  );

  const ln = segments.n;
  const lz = segments.z;
  const lmax = ln + lz;

  return Object.freeze({
    zero,
    first,
    last,
    ln: segments.n,
    lz: segments.z,
    ϰ,
    firstUnicodeNumber,
    lastUnicodeNumber,
    middleUnicodeNumber,
    middle: String.fromCharCode(middleUnicodeNumber),
    lmax,
    lϰ: Math.ceil((1 - ϰ) * lmax),
    base: lastUnicodeNumber - firstUnicodeNumber + 2,
  });

}

export default createNumberSystem;
