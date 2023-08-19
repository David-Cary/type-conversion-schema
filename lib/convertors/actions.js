"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypedActionsValueConvertor = exports.DEFAULT_UNTYPED_CONVERSIONS = exports.NestedConversionAction = exports.getConversionSchemaFrom = exports.getActionRequestFrom = exports.GetValueAction = exports.getNestedValue = exports.DefaultValueAction = exports.ForceValueAction = void 0;
const JSType_1 = require("../schema/JSType");
const JSON_1 = require("../schema/JSON");
class ForceValueAction {
    transform(value, options) {
        return (0, JSON_1.cloneJSON)(options?.value);
    }
}
exports.ForceValueAction = ForceValueAction;
class DefaultValueAction {
    transform(value, options) {
        return value === undefined ? (0, JSON_1.cloneJSON)(options?.value) : value;
    }
}
exports.DefaultValueAction = DefaultValueAction;
function getNestedValue(source, path) {
    if (typeof source === 'object' && source != null) {
        let target = source;
        const steps = Array.isArray(path) ? path : [path];
        for (let i = 0; i < steps.length; i++) {
            const step = steps[i];
            if (typeof target === 'object' && target != null) {
                if (Array.isArray(target)) {
                    const index = Number(step);
                    if (isNaN(index))
                        return undefined;
                    target = target[index];
                }
                const key = String(step);
                target = target[key];
            }
            else
                return undefined;
        }
        return target;
    }
    return source;
}
exports.getNestedValue = getNestedValue;
class GetValueAction {
    transform(value, options) {
        if (options?.path != null) {
            return getNestedValue(value, options.path);
        }
        return value;
    }
}
exports.GetValueAction = GetValueAction;
function getActionRequestFrom(source) {
    switch (typeof source) {
        case 'string': {
            return source;
        }
        case 'object': {
            if (typeof source === 'object' &&
                source != null &&
                typeof source.type === 'string') {
                return source;
            }
            break;
        }
    }
}
exports.getActionRequestFrom = getActionRequestFrom;
function getConversionSchemaFrom(source) {
    switch (typeof source) {
        case 'string': {
            return { type: source };
        }
        case 'object': {
            if (source != null && !Array.isArray(source)) {
                const schema = {
                    type: String(source.type)
                };
                if (Array.isArray(source.prepare)) {
                    schema.prepare = (0, JSType_1.getTypedArray)(source.prepare, item => getActionRequestFrom(item));
                }
                if (source.convertVia != null) {
                    schema.convertVia = getActionRequestFrom(source.convertVia);
                }
                if (Array.isArray(source.finalize)) {
                    schema.finalize = (0, JSType_1.getTypedArray)(source.finalize, item => getActionRequestFrom(item));
                }
                return schema;
            }
            break;
        }
    }
}
exports.getConversionSchemaFrom = getConversionSchemaFrom;
class NestedConversionAction {
    transform(value, options, resolver) {
        if (resolver != null && options != null) {
            const schema = getConversionSchemaFrom(options.to);
            if (schema != null) {
                return resolver.convert(value, schema);
            }
        }
        return value;
    }
    createSchema(options, resolver) {
        if (resolver != null && options != null) {
            const schema = getConversionSchemaFrom(options.to);
            if (schema != null) {
                const resolved = resolver.createJSTypeSchema(schema);
                if (resolved != null) {
                    if ('type' in resolved) {
                        return resolved;
                    }
                    if (resolved.anyOf?.length > 0) {
                        return resolved.anyOf[0];
                    }
                }
            }
        }
        return { type: 'any' };
    }
}
exports.NestedConversionAction = NestedConversionAction;
exports.DEFAULT_UNTYPED_CONVERSIONS = {
    convert: new NestedConversionAction(),
    default: new DefaultValueAction(),
    get: new GetValueAction(),
    setTo: new ForceValueAction()
};
class TypedActionsValueConvertor {
    constructor(typeName, convert, actions = {}) {
        this.typeName = typeName;
        this.convert = convert;
        this.actions = {
            untyped: actions.typed != null ? { ...actions.untyped } : exports.DEFAULT_UNTYPED_CONVERSIONS,
            conversion: actions.conversion != null ? { ...actions.conversion } : {},
            typed: actions.typed != null ? { ...actions.typed } : {}
        };
    }
    matches(value) {
        return (0, JSType_1.getExtendedTypeOf)(value) === this.typeName;
    }
    convertWith(value, schema, resolver) {
        let untypedResult = value;
        this.runPreparation(schema, (action, options) => {
            untypedResult = action.transform(untypedResult, options, resolver);
        });
        let conversionResult;
        this.runConversion(schema, (action, options) => {
            conversionResult = action.transform(untypedResult, options, resolver);
        });
        let typedResult = conversionResult != null
            ? conversionResult
            : this.convert(untypedResult);
        this.runFinalization(schema, (action, options) => {
            typedResult = action.transform(typedResult, options, resolver);
        });
        return typedResult;
    }
    expandActionRequest(request) {
        return typeof request === 'object' ? request : { type: request };
    }
    runPreparation(schema, callback) {
        if (schema.prepare != null) {
            for (const request of schema.prepare) {
                const options = this.expandActionRequest(request);
                const action = this.actions.untyped[options.type];
                if (action != null) {
                    callback(action, options);
                }
            }
        }
    }
    runConversion(schema, callback) {
        if (schema.convertVia != null) {
            const options = this.expandActionRequest(schema.convertVia);
            const action = this.actions.conversion[options.type];
            if (action != null) {
                callback(action, options);
            }
        }
    }
    runFinalization(schema, callback) {
        if (schema.finalize != null) {
            for (const request of schema.finalize) {
                const options = this.expandActionRequest(request);
                const action = this.actions.typed[options.type];
                if (action != null) {
                    callback(action, options);
                }
            }
        }
    }
    createJSTypeSchema(source, resolver) {
        if (source != null && resolver != null) {
            let untypedResult;
            this.runPreparation(source, (action, options) => {
                untypedResult = this.getModifiedSchema(action, options, resolver, untypedResult);
            });
            this.runConversion(source, (action, options) => {
                untypedResult = this.getModifiedSchema(action, options, resolver, untypedResult);
            });
            const typedResult = this.initializeJSTypeSchema(untypedResult);
            this.runFinalization(source, (action, options) => {
                const modifiedSchema = this.getModifiedSchema(action, options, resolver, typedResult);
                if (modifiedSchema != null) {
                    untypedResult = modifiedSchema;
                }
            });
            return typedResult;
        }
        return this.initializeJSTypeSchema();
    }
    getModifiedSchema(action, options, resolver, source) {
        if (source != null && action.modifySchema != null) {
            return action.modifySchema(source, options, resolver);
        }
        if (action.createSchema != null) {
            return action.createSchema(options, resolver);
        }
    }
    initializeJSTypeSchema(source) {
        if (source != null && 'type' in source && source.type === this.typeName) {
            return source;
        }
        if (this.typeName in Object.values(JSType_1.JSTypeName)) {
            const type = this.typeName;
            return (0, JSType_1.createBasicSchema)(type);
        }
        return { type: 'any' };
    }
}
exports.TypedActionsValueConvertor = TypedActionsValueConvertor;
