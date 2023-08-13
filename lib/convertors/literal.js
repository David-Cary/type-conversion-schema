"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToLiteralConvertor = void 0;
const JSON_1 = require("../schema/JSON");
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
        return (0, JSON_1.cloneJSON)(this.value);
    }
    convertWith(value) {
        return (0, JSON_1.cloneJSON)(this.value);
    }
}
exports.ToLiteralConvertor = ToLiteralConvertor;
