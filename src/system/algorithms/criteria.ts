/**
 * Checks when a value is between two strings such that:
 * before string < value string < after string
*/
export default function criteria(value: string, before: string, after: string) {
    return before < value && value < after;
}
