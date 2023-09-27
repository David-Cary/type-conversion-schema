"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypedActionsValueConvertor = exports.DEFAULT_UNTYPED_CONVERSIONS = exports.NestedConversionAction = exports.GetValueAction = exports.getNestedValue = void 0;
const conversions_1 = require("../schema/conversions");
const JSType_1 = require("../schema/JSType");
/**
 * Retrieves a nested property value for a given path.
 * @function
 * @param {amy} source - object the value should be drawn from
 * @param {any} path - key or array of keys to use to get the value
 * @returns {any} retrieved value, if any
 */
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
                else {
                    const key = String(step);
                    target = target[key];
                }
            }
            else
                return undefined;
        }
        return target;
    }
    return source;
}
exports.getNestedValue = getNestedValue;
/**
 * Handles redirecting to a nested value for the next step of a value conversion.
 * The path to the target value is taken from the option of the same name.
 * @class
 * @implements {TypeConversionAction}
 */
class GetValueAction {
    transform(value, options) {
        if (options?.path != null) {
            return getNestedValue(value, options.path);
        }
        return value;
    }
}
exports.GetValueAction = GetValueAction;
/**
 * Applies a conversion schema to the current value before passing it on the next action.
 * The schema to be used is passed in through the "to" option.
 * @class
 * @implements {TypeConversionAction}
 */
class NestedConversionAction {
    transform(value, options, resolver) {
        if (resolver != null && options?.to != null) {
            const schema = (0, conversions_1.getConversionSchemaFrom)(options.to);
            return resolver.convert(value, schema);
        }
        return value;
    }
    expandSchema(schema, options, resolver) {
        if (resolver != null && options?.to != null) {
            const subschema = (0, conversions_1.getConversionSchemaFrom)(options.to);
            const resolved = resolver.getExpandedSchema(subschema);
            options.to = resolved;
        }
    }
}
exports.NestedConversionAction = NestedConversionAction;
/**
 * Provides default conversion action handles for untyped values.
 * @const
 */
exports.DEFAULT_UNTYPED_CONVERSIONS = {
    convert: new NestedConversionAction(),
    get: new GetValueAction()
};
/**
 * Handles conversion of a given value to a variety of types depending on the provided schema.
 * @template T
 * @class
 * @implements {TypedValueConvertor<T>}
 * @property {string} typeName - associated javascript schema type name
 * @property {(value: unknown) => T} convert - default function for conversion to the target type
 * @property {TypedActionMap<T>} actions - map of action resolution handlers
 */
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
    convertWith(value, schema, resolver, context) {
        const untypedResult = this.prepareValue(value, schema, resolver, context);
        let schemaConversion;
        if (schema.convertVia != null) {
            const options = this.expandActionRequest(schema.convertVia);
            const action = this.actions.conversion[options.type];
            if (action != null) {
                schemaConversion = action.transform(untypedResult, options, resolver);
            }
        }
        let typedResult = schemaConversion != null
            ? schemaConversion
            : this.convert(untypedResult);
        typedResult = this.finalizeValue(typedResult, schema, resolver, context);
        return typedResult;
    }
    /**
     * Applies pre-conversion actions to the provided value.
     * @function
     * @param {unknown} value - value to be modified
     * @param {Partial<TypeConversionSchema>} schema - schema to be used for conversion
     * @param TypeConversionResolver | undefined} resolver - conversion resolver to be used on nested values
     * @param {TypeConversionContext | undefined} context - additional values to be used for resolving references
     * @returns {unknown} modified value
     */
    prepareValue(value, schema, resolver, context) {
        if (schema.prepare != null) {
            for (const request of schema.prepare) {
                const options = this.expandActionRequest(request);
                const action = this.actions.untyped[options.type];
                if (action != null) {
                    value = action.transform(value, options, resolver);
                }
            }
        }
        return value;
    }
    /**
     * Applies post-conversion actions to the provided value.
     * @function
     * @param {unknown} value - value to be modified
     * @param {Partial<TypeConversionSchema>} schema - schema to be used for conversion
     * @param TypeConversionResolver | undefined} resolver - conversion resolver to be used on nested values
     * @param {TypeConversionContext | undefined} context - additional values to be used for resolving references
     * @returns {unknown} modified value
     */
    finalizeValue(value, schema, resolver, context) {
        if (schema.finalize != null) {
            for (const request of schema.finalize) {
                const options = this.expandActionRequest(request);
                const action = this.actions.typed[options.type];
                if (action != null) {
                    value = action.transform(value, options, resolver);
                }
            }
        }
        return value;
    }
    expandActionRequest(request) {
        return typeof request === 'object' ? request : { type: request };
    }
    expandSchema(schema, resolver) {
        this.prepareSchema(schema, resolver);
        if (schema.convertVia != null) {
            this.expandSchemaFor(schema, schema.convertVia, this.actions.conversion, resolver);
        }
        this.finalizeSchema(schema, resolver);
    }
    /**
     * Applies pre-conversion actions to the provided schema.
     * @function
     * @param {Partial<TypeConversionSchema>} schema - schema to be modified
     * @param TypeConversionResolver | undefined} resolver - conversion resolver to be used on nested values
     */
    prepareSchema(schema, resolver) {
        if (schema.prepare != null) {
            for (const request of schema.prepare) {
                this.expandSchemaFor(schema, request, this.actions.untyped, resolver);
            }
        }
    }
    /**
     * Applies post-conversion actions to the provided schema.
     * @function
     * @param {Partial<TypeConversionSchema>} schema - schema to be modified
     * @param TypeConversionResolver | undefined} resolver - conversion resolver to be used on nested values
     */
    finalizeSchema(schema, resolver) {
        if (schema.finalize != null) {
            for (const request of schema.finalize) {
                this.expandSchemaFor(schema, request, this.actions.typed, resolver);
            }
        }
    }
    /**
     * Helper function for applying schema updates from a particular action request.
     * @function
     * @param {Partial<TypeConversionSchema>} schema - schema to be modified
     * @param {TypedActionRequest} request - action request to be used
     * @param {Record<string, TypeConversionAction<any>>} actionMap - action map to use for the provided request
     * @param TypeConversionResolver | undefined} resolver - conversion resolver to be used on nested values
     */
    expandSchemaFor(schema, request, actionMap, resolver) {
        const options = this.expandActionRequest(request);
        const action = actionMap[options.type];
        if (action?.expandSchema != null) {
            action.expandSchema(schema, options, resolver);
        }
    }
}
exports.TypedActionsValueConvertor = TypedActionsValueConvertor;
