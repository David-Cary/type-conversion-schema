"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToSymbolConvertor = exports.DEFAULT_SYMBOL_ACTIONS = exports.CreateKeySymbolAction = exports.getSymbolFrom = void 0;
const JSType_1 = require("../schema/JSType");
const actions_1 = require("./actions");
const string_1 = require("./string");
function getSymbolFrom(value) {
    switch (typeof value) {
        case 'string': {
            return Symbol(value);
        }
        case 'symbol': {
            return value;
        }
    }
    const description = (0, string_1.safeJSONStringify)(value);
    return Symbol(description);
}
exports.getSymbolFrom = getSymbolFrom;
class CreateKeySymbolAction {
    transform(value, options) {
        if (options != null && typeof options.key === 'string') {
            return Symbol.for(options.key);
        }
        if (typeof value === 'string') {
            return Symbol.for(value);
        }
        return getSymbolFrom(value);
    }
    createSchema(options, resolver) {
        const schema = { type: JSType_1.JSTypeName.SYMBOL };
        if (options != null && typeof options.value === 'string') {
            schema.key = options.value;
        }
        return schema;
    }
}
exports.CreateKeySymbolAction = CreateKeySymbolAction;
exports.DEFAULT_SYMBOL_ACTIONS = {
    untyped: { ...actions_1.DEFAULT_UNTYPED_CONVERSIONS },
    conversion: {
        forKey: new CreateKeySymbolAction()
    },
    typed: {}
};
class ToSymbolConvertor extends actions_1.TypedActionsValueConvertor {
    constructor(actions = exports.DEFAULT_SYMBOL_ACTIONS) {
        super('symbol', getSymbolFrom, actions);
    }
}
exports.ToSymbolConvertor = ToSymbolConvertor;
