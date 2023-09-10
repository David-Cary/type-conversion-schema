"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToLiteralConvertor = void 0;
const JSON_1 = require("../schema/JSON");
/**
 * Handles conversion of a given value to a variety of types depending on the provided schema.
 * @template T
 * @class
 * @implements {TypedValueConvertor<T>}
 * @property {T} value - fixed value to change any input to
 */
class ToLiteralConvertor {
    constructor(value) {
        this.value = value;
    }
    matches(value) {
        return value === this.value;
    }
    convert(value) {
        return (0, JSON_1.cloneJSON)(this.value);
    }
    convertWith(value) {
        return (0, JSON_1.cloneJSON)(this.value);
    }
}
exports.ToLiteralConvertor = ToLiteralConvertor;
