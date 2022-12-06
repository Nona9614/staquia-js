import is from "guardex";

import type { NumberSystem, PositionValue } from "./types";

// Utils
import utils from "./system/utils";

// Algorithms
import between from "./system/algorithms/between";
import diverge from "./system/algorithms/diverge";
import after from "./system/algorithms/after";
import before from "./system/algorithms/before";

/**
 * This objects represents a postion like `zzzzsssssssss` where:
 *  - N are the numbered position
 *  - Z is a special string generated when an insertion between
 *    two positions with no room
*/
export default class Position {

    /** Left number for after and before operations */
    public n: string = "";
    /** Right number for diverge and between operations */
    public z: string = "";
    /** Reference number sytem */
    #system: NumberSystem;

    /**
     * @param system The number system to use for the position functions
     * @param value Used to set a default value for the position
    */
    constructor(system: NumberSystem, value?: PositionValue) {
        this.#system = system;

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
            for (let i = 0; i < system.ln; i++) this.n += system.zero;
            this.z = system.zero;
        };
    }

    /**
     * Gets the relative next position from another position
    */
    public next() {
        const n = after(this.#system, this.n);
        return new Position(this.#system, n);
    }

    /**
     * Gets the relative next position from another position
    */
    public previous() {
        const n = before(this.#system, this.n);
        return new Position(this.#system, n);
    }

    /**
     * Returns the value that lies between the current postion and another
     * @param relative The position that should go before or after thi current position
     */
    public core(relative: Position) {
        let previous: Position = this;
        let next: Position = relative;

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
            diverge(this.#system, previous.toString(), next.toString()) :
            between(this.#system, previous.n, next.n);
        
        return new Position(this.#system, final);
    }

    /**
     * Transforms a string to a `position` object
     * @param string Is the value to be parsed 
    */
    public parse(string: string) {
        this.n = string.substring(0, this.#system.ln);
        if (string.length > this.#system.ln) {
            this.z = string.substring(this.#system.ln);
        } else {
            this.n = utils.untrim(this.#system, this.n, this.#system.ln);
            this.z = this.#system.zero;
        }
    }

    /**
     * Updates the position based on the input values
    */
    public update({ n, z }: { n?: string, z?: string }) {
        if (is.string(n)) this.n = utils.untrim(this.#system, n, this.#system.ln);
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
        return utils.isZero(this.#system, this.z) ? this.n : this.n + this.z;
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
