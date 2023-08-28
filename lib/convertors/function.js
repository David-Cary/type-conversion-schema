"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToFunctionConvertor = exports.DEFAULT_FUNCTION_ACTIONS = exports.CreateWrapperFunctionAction = exports.getFunctionFrom = void 0;
const JSType_1 = require("../schema/JSType");
const actions_1 = require("./actions");
function getFunctionFrom(value) {
    if (typeof value === 'function') {
        return value;
    }
    return () => value;
}
exports.getFunctionFrom = getFunctionFrom;
class CreateWrapperFunctionAction {
    transform(value, options, resolver) {
        if (typeof value === 'function') {
            return value;
        }
        if (options != null && resolver != null) {
            const returnSchema = (0, actions_1.getConversionSchemaFrom)(options.returns);
            if (returnSchema != null) {
                return () => resolver.convert(value, returnSchema);
            }
        }
        return () => value;
    }
    expandSchema(schema, options) {
        if (schema.type === JSType_1.JSTypeName.FUNCTION) {
            const returnSchema = (0, actions_1.getConversionSchemaFrom)(options?.returns);
            if (returnSchema != null) {
                schema.returns = returnSchema;
            }
        }
    }
}
exports.CreateWrapperFunctionAction = CreateWrapperFunctionAction;
exports.DEFAULT_FUNCTION_ACTIONS = {
    untyped: { ...actions_1.DEFAULT_UNTYPED_CONVERSIONS },
    conversion: {
        wrap: new CreateWrapperFunctionAction()
    },
    typed: {}
};
class ToFunctionConvertor extends actions_1.TypedActionsValueConvertor {
    constructor(actions = exports.DEFAULT_FUNCTION_ACTIONS) {
        super('function', getFunctionFrom, actions);
    }
}
exports.ToFunctionConvertor = ToFunctionConvertor;
