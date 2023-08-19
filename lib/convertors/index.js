"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_TYPE_CONVERTORS = void 0;
const array_1 = require("./array");
const bigint_1 = require("./bigint");
const boolean_1 = require("./boolean");
const literal_1 = require("./literal");
const number_1 = require("./number");
const object_1 = require("./object");
const string_1 = require("./string");
const symbol_1 = require("./symbol");
__exportStar(require("./actions"), exports);
__exportStar(require("./array"), exports);
__exportStar(require("./bigint"), exports);
__exportStar(require("./boolean"), exports);
__exportStar(require("./literal"), exports);
__exportStar(require("./number"), exports);
__exportStar(require("./object"), exports);
__exportStar(require("./string"), exports);
__exportStar(require("./symbol"), exports);
exports.DEFAULT_TYPE_CONVERTORS = {
    array: new array_1.ToArrayConvertor(),
    bigint: new bigint_1.ToBigIntConvertor(),
    boolean: new boolean_1.ToBooleanConvertor(),
    null: new literal_1.ToLiteralConvertor(null),
    number: new number_1.ToNumberConvertor(),
    object: new object_1.ToObjectConvertor(),
    string: new string_1.ToStringConvertor(),
    symbol: new symbol_1.ToSymbolConvertor(),
    undefined: new literal_1.ToLiteralConvertor(undefined)
};
