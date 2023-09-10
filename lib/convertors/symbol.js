"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToSymbolConvertor = exports.DEFAULT_SYMBOL_ACTIONS = exports.CreateKeySymbolAction = exports.getSymbolFrom = void 0;
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
/**
 * Handles using the symbol for a particular key string.
 * @class
 * @implements {TypeConversionAction<any, symbol>}
 */
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
    expandSchema(schema, options) {
        if (schema.type === 'symbol' &&
            options != null &&
            typeof options.key === 'string') {
            schema.key = options.key;
        }
    }
}
exports.CreateKeySymbolAction = CreateKeySymbolAction;
/**
 * Provides default actions for conversions to a symbol.
 * @const
 */
exports.DEFAULT_SYMBOL_ACTIONS = {
    untyped: { ...actions_1.DEFAULT_UNTYPED_CONVERSIONS },
    conversion: {
        forKey: new CreateKeySymbolAction()
    },
    typed: {}
};
/**
 * Handles conversion of a given value to a symbol.
 * @class
 * @implements {TypedActionsValueConvertor<symbol>}
 */
class ToSymbolConvertor extends actions_1.TypedActionsValueConvertor {
    constructor(actions = exports.DEFAULT_SYMBOL_ACTIONS) {
        super('symbol', getSymbolFrom, actions);
    }
}
exports.ToSymbolConvertor = ToSymbolConvertor;
