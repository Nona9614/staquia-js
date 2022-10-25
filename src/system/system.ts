import is from 'guardex';

/** The number system */
const system = {
    /** The unicode character that represents the zero value */
    zero: "!",

    /** The unicode character that represents the first value in the set */
    first: '"',

    /** The unicode character number that represents the first value in the set */
    firstUnicodeNumber: 34,

    /** The unicode character that represents the last value in the set */
    last: "~",

    /** The unicode character number that represents the last value in the set */
    lastUnicodeNumber: 126,

    /** The unicode character that represents the middle value in the set */
    middle: "P",

    /** The unicode character number that represents the middle value in the set */
    middleUnicodeNumber: 80,

    /** The base of the number set */
    base: 94,

    /** Updates the set using the global stored values */
    update({ first, last, zero }: { first?: string, last?: string, zero?: string }) {

        if (is.string(first)) this.first = first;
        this.firstUnicodeNumber = this.first.charCodeAt(0);

        if (is.string(last)) this.last = last;
        this.lastUnicodeNumber = this.last.charCodeAt(0);

        if (is.string(zero)) this.zero = zero;

        this.middleUnicodeNumber = Math.ceil((this.firstUnicodeNumber + this.lastUnicodeNumber) / 2)
        this.middle = String.fromCharCode(this.middleUnicodeNumber);

        this.base = this.lastUnicodeNumber - this.firstUnicodeNumber + 2;
    },

    /** A chararacter from the system is returned as a code number */
    code(char: string) {
        return char === this.zero ? 0 : char.charCodeAt(0) - this.firstUnicodeNumber + 1;
    },

    /** A code is returned as a character from the system */
    char(code: number) {
        return code === 0 ? this.zero : String.fromCharCode(code + this.firstUnicodeNumber - 1);
    },

    /**
     * Gets the room between two characters
     * @returns The difference between the characters, but if any of them is not an string will return null
    */
    room(before: string, after: string) {
        return is.string(before) && is.string(after) ? this.code(after) - this.code(before) : null;
    },

    /** Checks if some strings are the zero character */
    isZero(...values: string[]) {
        return values.every(value => value === this.zero);
    },

    /** Removes all leading zeroes from the string */
    trim(value: string) {
        let stillLeadingZeroes: boolean = true;
        for (let i = 0; i < value.length; i++) {
            const char = value[i];
            stillLeadingZeroes &&= (char === this.zero);
            if (!stillLeadingZeroes) return value.substring(i, value.length);
        }
        return value;
    },

    /** Given an expected size, concats all missing leading zeroes */
    untrim(string: string, size: number) {
        let s: string = string;
        if (string.length < size) {
            do {
                s = this.zero + s;
            } while (s.length < size);
        }
        return s;
    }
}

export default system;
