// Zod
import is from "guardex";
import Position from "./position";
import { symbol } from "./symbol";

// Used for validate the schema
let _ln: number = 0;
let _lz: number = 0;

/** Valid keys */
const schema = new Set(["n", "z", "symbol"]);
export function isPositionObject(value?: any) {
  // Object must be pure (No prototype)
  if (
    !is.json<{
      n: string;
      z?: string;
      symbol?: Symbol;
    }>(value)
  )
    return false;

  // Only valid keys are
  // `n` required
  // `z` optional
  // `symbol` optional
  const keys = Object.keys(value);
  if (keys.length < 1 || keys.length > 3) return false;
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i] as string;
    const val = (value as any)[key];
    // `n` should be a `string` with max length `ln`
    if (key === "n" && !(is.string(val) && is.smallerOrEqual(val.length, _ln)))
      return false;
    // `z` should be a `string` with max length `lz`
    else if (
      key === "z" &&
      !(is.string(val) && is.smallerOrEqual(val.length, _lz))
    )
      return false;
    // `symbol` should be the above
    else if (key === "symbol" && val !== symbol) return false;
    // If an invalid key is found, remove it
    else if (!schema.has(key)) return false;
  }

  // Only if all tests passed, is a valid object
  return true;
}

export function isPosition(value?: any) {
  if (is.value(value) && value instanceof Position && value.symbol === symbol) {
    const { n, z } = value.toObject();
    return is.smallerOrEqual(n.length, _ln) && is.smallerOrEqual(z.length, _lz);
  } else return false;
}

const schemas = {
  set ln(value: number) {
    _ln = value;
  },
  set lz(value: number) {
    _lz = value;
  },
};

export default schemas;
