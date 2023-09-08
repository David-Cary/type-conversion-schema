/**
 * Covers all data types that can be used in a JSON object.
 * @type {string | number | boolean | null | object | Array}
 */
export type JSONType = string | number | boolean | null | {
    [key: string]: JSONType;
} | JSONType[];
/**
 * Covers an object that complies with JSON rules.
 * @type {object}
 */
export type JSONObject = Record<string, JSONType>;
/**
 * Creates a copy of the provided value as if it were a JSON value.
 * @function
 * @param {any} source - value to be copied
 * @returns {any} copy of the provided value
 */
export declare function cloneJSON(source: any): any;
