import is from "guardex";
import { system, after, before, diverge, between } from "./system";

/**
 * Sizes from the position strings 
 */
export const sizes = {
    n: 4,
    z: 12,
    update({ n, z }: { n?: number, z?: number }) {
        if (is.positive(n)) this.n = n;
        if (is.positive(z)) this.z = z;
    }
}

/**
 * This objects represents a postion like `zzzzsssssssss` where:
 *  - N are the numbered position
 *  - Z is a special string generated when an insertion between
 *    two positions with no room
*/
export default class StaquiaPosition {

    /** Left number for after and before operations */
    public n: string = "";
    /** Right number for diverge and between operations */
    public z: string = "";

    /**
     *  @param value Used to set a default value for the position
    */
    constructor(value?: string | { n: string, z?: string }) {
        if (is.string(value)) {
            // Parses the default value and assing it
            this.parse(value);
        } else if (is.object(value)) {
            // Starts the default value from an object
            let string: string = value.n;
            if (is.string(value.z)) string += value.z;
            this.parse(string);
        } else {
            // Starts the n with only zeroes
            for (let i = 0; i < sizes.n; i++) this.n += system.zero;
            this.z = system.zero;
        };
    }

    /**
     * Gets the relative next position from another position
    */
    public next() {
        const n = after(this.n);
        return new StaquiaPosition(n);
    }

    /**
     * Gets the relative next position from another position
    */
    public previous() {
        const n = before(this.n);
        return new StaquiaPosition(n);
    }

    /**
     * Returns the value that lies between the current postion and another
     * @param relative The position that should go before or after thi current position
     */
    public core(relative: StaquiaPosition) {
        let previous: StaquiaPosition = this;
        let next: StaquiaPosition = relative;

        // Set the proper weight
        if (previous > next) {
            const temp = previous;
            next = previous;
            previous = temp;
        }

        // If there is not enough room (above 1) use diverge,
        // if not use between
        const final: string = 
            previous.n === next.n || previous.next().n === next.n ?
            diverge(previous.toString(), next.toString()) :
            between(previous.n, next.n);
        
        return new StaquiaPosition(final);
    }

    /**
     * Transforms a string to a `position` object
     * @param string Is the value to be parsed 
    */
    public parse(string: string) {
        this.n = string.substring(0, sizes.n);
        if (string.length > sizes.n) {
            this.z = string.substring(sizes.n);
        } else {
            this.n = system.untrim(this.n, sizes.n);
            this.z = system.zero;
        }

    }

    /**
     * Updates the position based on the input values
    */
    public update({ n, z }: { n?: string, z?: string }) {
        if (is.string(n)) this.n = system.untrim(n, sizes.n);
        if (is.string(z)) this.z = z;
    }

    /**
     * Use as value of the string transformation
    */
    public valueOf() {
        return this.toString();
    }

    /**
     * Concatenates the `n` value with the `z`
    */
    public toString() {
        return system.isZero(this.z) ? this.n : this.n + this.z;
    }

    /**
     * Gets the `n` value with the `z` value
    */
    public toObject() {
        return {
            n: this.n,
            z: this.z
        };
    }

}
