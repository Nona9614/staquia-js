import StaquiaPosition from './staquia-position';
import { system } from './system';
import { sizes } from "./staquia-position";

/**
 * A class that helps to have a dynamic position algorith using number systems
 * @example All that is menioned here are the default values
 * 
 * // An odd base (like 27th [a-z]) shoud be used with a zero character
 * // smaller than any value of the set (like [!])
 * const zero = "!"
 * const first = "a"
 * const last = "z"
 * 
 * // Sizes for the position algorithm, like `n = 4` and `z = 12`
 * // to generate positions like nnnn-zzzz-zzzz-zzzz
 * const size = { n: 4, z = 12 }
 */
export class Staquia {

    public static set zero(value: string) {
        system.update({ zero: value });
    };

    public static get zero() {
        return system.zero;
    };

    public static set first(value: string) {
        system.update({ first: value });
    };

    public static get first() {
        return system.first;
    };

    public static set last(value: string) {
        system.update({ last: value });
    };

    public static get last() {
        return system.last;
    };

    /** Updates the numeric system that will be used */
    public static update(options: { first?: string, last?: string, zero?: string }) {
        system.update(options);
    };

    /** Updates the sizes from the system */
    public static set size(value: { n: number, z: number }) {
        sizes.update(value);
    }

    /** Gets the size from the system */
    public static get size() {
        return {
            n: sizes.n,
            z: sizes.z,
        }
    }
}

// Force to export the settings here for rollup to expose them
export { StaquiaPosition }