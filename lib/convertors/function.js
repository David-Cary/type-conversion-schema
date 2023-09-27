"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToFunctionConvertor = exports.DEFAULT_FUNCTION_ACTIONS = exports.CreateWrapperFunctionAction = void 0;
const conversions_1 = require("../schema/conversions");
const JSType_1 = require("../schema/JSType");
const actions_1 = require("./actions");
/**
 * Creates a function that returns the provided value.
 * If a 'returns' option is provided, that will be used as a conversion schema to be applied to the provided value.
 * @class
 * @implements {TypeConversionAction<any, AnyFunction>}
 */
class CreateWrapperFunctionAction {
    transform(value, options, resolver) {
        if (typeof value === 'function') {
            return value;
        }
        if (options?.returns != null && resolver != null) {
            const returnSchema = (0, conversions_1.getConversionSchemaFrom)(options.returns);
            return () => resolver.convert(value, returnSchema);
        }
        return () => value;
    }
    expandSchema(schema, options) {
        if (schema.type === JSType_1.JSTypeName.FUNCTION && options?.returns) {
            const returnSchema = (0, conversions_1.getConversionSchemaFrom)(options.returns);
            schema.returns = returnSchema;
        }
    }
}
exports.CreateWrapperFunctionAction = CreateWrapperFunctionAction;
/**
 * Provides default actions for conversions to a function.
 * @const
 */
exports.DEFAULT_FUNCTION_ACTIONS = {
    untyped: { ...actions_1.DEFAULT_UNTYPED_CONVERSIONS },
    conversion: {
        wrap: new CreateWrapperFunctionAction()
    },
    typed: {}
};
/**
 * Handles conversion of a given value to a function.
 * @class
 * @implements {TypedActionsValueConvertor<AnyFunction>}
 */
class ToFunctionConvertor extends actions_1.TypedActionsValueConvertor {
    constructor(actions = exports.DEFAULT_FUNCTION_ACTIONS) {
        super('function', conversions_1.getFunctionFrom, actions);
    }
}
exports.ToFunctionConvertor = ToFunctionConvertor;
