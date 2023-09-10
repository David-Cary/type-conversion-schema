"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToAnyConvertor = void 0;
const JSON_1 = require("../schema/JSON");
const actions_1 = require("./actions");
/**
 * Only applies non-type specific actions to the provided value.
 * @class
 * @implements {TypedActionsValueConvertor<any>}
 */
class ToAnyConvertor extends actions_1.TypedActionsValueConvertor {
    constructor(actions = actions_1.DEFAULT_UNTYPED_CONVERSIONS) {
        const actionMap = {
            typed: actions,
            untyped: actions,
            conversion: actions
        };
        super('any', (value) => value, actionMap);
    }
    finalizeValue(value, schema, resolver) {
        value = super.finalizeValue(value, schema, resolver);
        if ('const' in schema) {
            return (0, JSON_1.cloneJSON)(schema.const);
        }
        if (value === undefined && 'default' in schema) {
            return (0, JSON_1.cloneJSON)(schema.default);
        }
        return value;
    }
}
exports.ToAnyConvertor = ToAnyConvertor;
