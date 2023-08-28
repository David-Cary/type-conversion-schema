"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToLiteralConvertor = void 0;
const conversions_1 = require("../schema/conversions");
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
    createJSTypeSchema(source) {
        const schema = (0, JSON_1.cloneJSON)(source);
        schema.type = (0, JSType_1.getExtendedTypeOf)(this.value);
        (0, conversions_1.removeTypeConversionActionsFrom)(schema);
        return schema;
    }
}
exports.ToLiteralConvertor = ToLiteralConvertor;
