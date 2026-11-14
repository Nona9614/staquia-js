/**
 * The result of `compare`: `"less"` if the first value goes before the second,
 * `"equal"` if they have the same value, `"greater"` if it goes after.
 *
 * @group Unions
 */
type Ordering = "greater" | "equal" | "less";
export default Ordering;
