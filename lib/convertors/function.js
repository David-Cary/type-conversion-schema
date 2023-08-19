"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToSymbolConvertor = exports.DEFAULT_FUNCTION_ACTIONS = exports.CreateConversionFunctionAction = exports.getFunctionFrom = void 0;
const JSType_1 = require("../schema/JSType");
const actions_1 = require("./actions");
const object_1 = require("./object");
const array_1 = require("./array");
function getFunctionFrom(value) {
    if (typeof value === 'function') {
        return value;
    }
    return () => value;
}
exports.getFunctionFrom = getFunctionFrom;
class CreateConversionFunctionAction {
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
    createSchema(options, resolver) {
        const schema = { type: JSType_1.JSTypeName.FUNCTION };
        if (options != null) {
            if (options.parameters != null) {
                schema.parameters = this.getParameterSchemas(options.parameters);
            }
            if (options.optionalParameters != null) {
                schema.optionalParameters = this.getParameterSchemas(options.optionalParameters);
            }
        }
        return schema;
    }
    getParameterSchema(source, resolver) {
        const request = (0, object_1.getConversionRequestFrom)(source);
        if (request != null) {
            if (resolver != null) {
                const resolved = resolver.createJSTypeSchema(request);
                if (resolved != null)
                    return resolved;
            }
            let typeName = 'any';
            if (typeof request === 'object' && 'type' in request) {
                typeName = request.type;
            }
            else if (typeof request === 'string') {
                typeName = request;
            }
            if (typeName in Object.values(JSType_1.JSTypeName)) {
                const type = typeName;
                return (0, JSType_1.createBasicSchema)(type);
            }
        }
        return { type: 'any' };
    }
    getParameterSchemas(source, resolver) {
        const rawParams = (0, array_1.getArrayFrom)(source);
        const conversions = rawParams.map(param => this.getParameterSchema(param));
        return conversions;
    }
}
exports.CreateConversionFunctionAction = CreateConversionFunctionAction;
exports.DEFAULT_FUNCTION_ACTIONS = {
    untyped: { ...actions_1.DEFAULT_UNTYPED_CONVERSIONS },
    conversion: {
        forKey: new CreateConversionFunctionAction()
    },
    typed: {}
};
class ToSymbolConvertor extends actions_1.TypedActionsValueConvertor {
    constructor(actions = exports.DEFAULT_FUNCTION_ACTIONS) {
        super('function', getFunctionFrom, actions);
    }
}
exports.ToSymbolConvertor = ToSymbolConvertor;
