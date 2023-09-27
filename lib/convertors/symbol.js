"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToSymbolConvertor = exports.DEFAULT_SYMBOL_ACTIONS = exports.CreateKeySymbolAction = void 0;
const conversions_1 = require("../schema/conversions");
const actions_1 = require("./actions");
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
        return (0, conversions_1.getSymbolFrom)(value);
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
        super('symbol', conversions_1.getSymbolFrom, actions);
    }
}
exports.ToSymbolConvertor = ToSymbolConvertor;
