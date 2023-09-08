"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cloneJSON = void 0;
/**
 * Creates a copy of the provided value as if it were a JSON value.
 * @function
 * @param {any} source - value to be copied
 * @returns {any} copy of the provided value
 */
function cloneJSON(source) {
    if (typeof source === 'object' && source != null) {
        if (Array.isArray(source)) {
            return source.map(item => cloneJSON(item));
        }
        const result = {};
        const values = source;
        for (const key in values) {
            result[key] = cloneJSON(values[key]);
        }
        return result;
    }
    return source;
}
exports.cloneJSON = cloneJSON;
