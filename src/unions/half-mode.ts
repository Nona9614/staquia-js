/**
 * Internal: how two numbers of different length are aligned before finding the value between them.
 * `"between"` pads the shorter one with zeroes on the left (leading zeroes),
 * `"diverge"` pads it with zeroes on the right (trailing zeroes).
 *
 * @group Unions
 */
type HalfMode = "between" | "diverge";
export default HalfMode;
