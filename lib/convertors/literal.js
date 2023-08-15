"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToLiteralConvertor = void 0;
const JSType_1 = require("../schema/JSType");
const JSON_1 = require("../schema/JSON");
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
    createJSTypeSchema() {
        const schema = {
            type: (0, JSType_1.getExtendedTypeOf)(this.value)
        };
        if (this.value != null) {
            const typed = schema;
            typed.const = (0, JSON_1.cloneJSON)(this.value);
        }
        return schema;
    }
}
exports.ToLiteralConvertor = ToLiteralConvertor;
