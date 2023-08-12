"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToLiteralConvertor = exports.cloneJSON = void 0;
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
class ToLiteralConvertor {
    constructor(value) {
        this.value = value;
    }
    getAction(key) {
        return undefined;
    }
    matches(value) {
        return value === this.value;
    }
    convert(value) {
        return cloneJSON(this.value);
    }
    convertWith(value, actions) {
        return cloneJSON(this.value);
    }
}
exports.ToLiteralConvertor = ToLiteralConvertor;
