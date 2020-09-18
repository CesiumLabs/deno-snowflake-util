// @ts-ignore
import { Base64 } from "https://deno.land/x/bb64@1.1.0/mod.ts";

/**
 * A Twitter like snowflake
 * ```
 * If we have a snowflake '266241948824764416' we can represent it as binary:
 *
 * 64                                          22     17     12          0
 *  000000111011000111100001101001000101000000  00001  00000  000000000000
 *       number of ms since epoch               worker  pid    increment
 * ```
 */
type Snowflake = string;

/**
 * A deconstructed snowflake.
 * @property timestamp Timestamp the snowflake was created
 * @property date Date the snowflake was created
 * @property workerID Worker ID in the snowflake
 * @property processID Process ID in the snowflake
 * @property increment Increment in the snowflake
 * @property binary Binary representation of the snowflake
 * @property snowflake Snowflake
 * @property epoch The epoch
 */
type DeconstructedSnowflake = {
    timestamp: number;
    date: Date;
    workerID: number;
    processID: number;
    increment: number;
    binary: string;
    snowflake: Snowflake;
    epoch: number;
}

interface Options {
    epoch?: number | Date;
    increment?: number;
}

/**
 * Snowflake Utility Class
 */
class SnowflakeUtil {
    EPOCH: number;
    INCREMENT: number;

    /**
     * Snowflake Util Constructor
     * @param options Constructor options
     * @param [options.epoch] Epoch timestamp
     * @param [options.increment] Number of increment
     * @example const Snowflake = require("snowflake-util");
     * const snowflake = new Snowflake();
     * 
     * const generated = snowflake.generate();
     * const deconstructed = snowflake.deconstruct(generated);
     * 
     * console.log(generated);
     * console.log(deconstructed);
     */
    public constructor(ops: Options = {}) {
        /**
         * Epoch timestamp
         */
        this.EPOCH = !ops.epoch ? 1420070400000 : ops.epoch instanceof Date ? ops.epoch.getTime() : 1420070400000;

        /**
         * Increment
         */
        this.INCREMENT = ops.increment && typeof ops.increment === "number" ? ops.increment : 0;
    }

    /**
     * Generates random Snowflake.
     * **This hardcodes the worker ID as 1 and the process ID as 0.**
     * @param [timestamp=Date.now()] Timestamp or date of the snowflake to generate
     * @returns The generated snowflake
     */
    public generate(timestamp: number | Date = Date.now()): Snowflake {
        if (timestamp instanceof Date) timestamp = timestamp.getTime();
        if (typeof timestamp !== "number" || isNaN(timestamp)) {
            throw new TypeError(`"timestamp" argument must be a number (received ${isNaN(timestamp) ? "NaN" : typeof timestamp})`);
        }
        if (this.INCREMENT >= 4095) this.INCREMENT = 0;

        // @ts-ignore
        const BINARY = `${(timestamp - this.EPOCH).toString(2).padStart(42, "0")}0000100000${(this.INCREMENT++).toString(2).padStart(12, "0")}`;

        return this.fromBinary(BINARY);
    }

    /**
     * Deconstructs a Discord snowflake.
     * @param snowflake Snowflake to deconstruct
     * @returns Deconstructed snowflake
     */
    public deconstruct(snowflake: Snowflake): DeconstructedSnowflake {
        if (snowflake === "0") return {
            epoch: this.EPOCH,
            timestamp: this.EPOCH,
            workerID: 0,
            processID: 0,
            increment: 0,
            binary: "0".repeat(64),
            date: new Date(this.EPOCH),
            snowflake: snowflake
        };

        // @ts-ignore
        const BINARY = this.toBinary(snowflake).toString(2).padStart(64, "0");

        const res = {
            epoch: this.EPOCH,
            timestamp: parseInt(BINARY.substring(0, 42), 2) + this.EPOCH,
            workerID: parseInt(BINARY.substring(42, 47), 2),
            processID: parseInt(BINARY.substring(47, 52), 2),
            increment: parseInt(BINARY.substring(52, 64), 2),
            binary: BINARY
        };

        return {
            ...res,
            date: new Date(res.timestamp),
            snowflake: snowflake
        };
    }

    /**
     * Transforms a snowflake from a decimal string to a bit string.
     * @param num Snowflake to be transformed
     */
    private fromBinary(num: string): Snowflake {
        let dec = "";

        while (num.length > 50) {
            const high = parseInt(num.slice(0, -32), 2);
            const low = parseInt((high % 10).toString(2) + num.slice(-32), 2);

            dec = (low % 10).toString() + dec;

            // @ts-ignore
            num = Math.floor(high / 10).toString(2) + Math.floor(low / 10).toString(2).padStart(32, "0");
        }

        let numb = parseInt(num, 2);
        while (numb > 0) {
            dec = (numb % 10).toString() + dec;
            numb = Math.floor(numb / 10);
        }

        if (!dec) throw new Error("Invalid Snowflake");

        return dec;
    }

    /**
     * Transforms a snowflake from a bit string to a decimal string.
     * @param num Bit string to be transformed
     */
    private toBinary(num: string): Snowflake {
        let bin = "";
        let high = parseInt(num.slice(0, -10)) || 0;
        let low = parseInt(num.slice(-10));
        while (low > 0 || high > 0) {
        bin = String(low & 1) + bin;
        low = Math.floor(low / 2);
            if (high > 0) {
                low += 5000000000 * (high % 2);
                high = Math.floor(high / 2);
            }
        }

        if (!bin) throw new Error("Invalid snowflake");

        return bin;
    }

    /**
     * Converts a snowflake into **Base64** 
     * @param snowflake a Snowflake
     */
    public toBase64(snowflake: Snowflake): string {
        if (!snowflake || typeof snowflake !== "string") throw new Error(`The parameter "snowflake" must be a string, received ${typeof snowflake}!`);
        
        // validate snowflake
        this.deconstruct(snowflake);

        return Base64.fromString(snowflake).toString();
    }

    /**
     * Converts Base64 encoded Snowflake to deconstructed snowflake object
     * @param base64Snowflake Base64 encoded Snowflake
     */
    public fromBase64(base64Snowflake: string): DeconstructedSnowflake {
        if (!base64Snowflake || typeof base64Snowflake !== "string") throw new Error(`The parameter "base64Snowflake" must be a string, received ${typeof base64Snowflake}!`);
        const des = Base64.fromBase64String(base64Snowflake).toString();
        const deconstructed = this.deconstruct(des);

        return {
            ...deconstructed,
            snowflake: des
        };
    }

}

export default SnowflakeUtil;