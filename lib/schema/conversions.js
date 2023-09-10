"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypeConversionResolver = exports.convertRecordValues = exports.typeConversionToJSTypeSchema = exports.removeTypeConversionActionsFrom = exports.parseTypeConversionRequest = void 0;
const JSType_1 = require("./JSType");
/**
 * Ensures a TypeConversionRequest is in an object format.
 * @function
 * @param {TypeConversionRequest} request - request to be coverted.
 * @returns {JSONSchema} resulting conversion schema, union, or reference
 */
function parseTypeConversionRequest(request) {
    if (typeof request === 'string') {
        return { type: request };
    }
    return request;
}
exports.parseTypeConversionRequest = parseTypeConversionRequest;
/**
 * Strips type conversion callbacks from a TypeConversionSchema.
 * @function
 * @param {TypeConversionSchema} schema - schema to be modified
 */
function removeTypeConversionActionsFrom(schema) {
    if ('prepare' in schema) {
        delete schema.prepare;
    }
    if ('convertVia' in schema) {
        delete schema.convertVia;
    }
    if ('finalize' in schema) {
        delete schema.finalize;
    }
}
exports.removeTypeConversionActionsFrom = removeTypeConversionActionsFrom;
/**
 * Converts a TypeConversionRequest to a javascript type schema.
 * @function
 * @param {TypeConversionRequest} request - request to be coverted
 * @returns {JSTypeSchema} resulting JSON javascript type schema
 */
function typeConversionToJSTypeSchema(request) {
    if (typeof request === 'string') {
        return { type: request };
    }
    const schema = { ...request };
    if ('type' in request) {
        removeTypeConversionActionsFrom(schema);
        switch (request.type) {
            case 'array': {
                if (request.additionalItems != null) {
                    schema.additionalItems = typeConversionToJSTypeSchema(request.additionalItems);
                }
                if (request.contains != null) {
                    schema.contains = typeConversionToJSTypeSchema(request.contains);
                }
                if (request.items != null) {
                    schema.items = typeConversionToJSTypeSchema(request.items);
                }
                if (request.prefixItems != null) {
                    schema.prefixItems = request.prefixItems.map(item => typeConversionToJSTypeSchema(item));
                }
                break;
            }
            case 'function': {
                if (request.parameters != null) {
                    schema.parameters = request.parameters.map(item => typeConversionToJSTypeSchema(item));
                }
                if (request.optionalParameters != null) {
                    schema.optionalParameters = request.optionalParameters.map(item => typeConversionToJSTypeSchema(item));
                }
                if (request.additionalParameters != null) {
                    schema.additionalParameters = typeConversionToJSTypeSchema(request.additionalParameters);
                }
                if (request.returns != null) {
                    schema.returns = typeConversionToJSTypeSchema(request.returns);
                }
                break;
            }
            case 'object': {
                if (request.additionalProperties != null) {
                    schema.additionalProperties = typeConversionToJSTypeSchema(request.additionalProperties);
                }
                if (request.patternProperties != null) {
                    schema.patternProperties = convertRecordValues(request.patternProperties, typeConversionToJSTypeSchema);
                }
                if (request.properties != null) {
                    schema.properties = convertRecordValues(request.properties, typeConversionToJSTypeSchema);
                }
                break;
            }
        }
    }
    else if ('anyOf' in request) {
        schema.anyOf = request.anyOf.map(option => typeConversionToJSTypeSchema(option));
    }
    else if ('$ref' in request) {
        schema.$ref = request.$ref;
    }
    return schema;
}
exports.typeConversionToJSTypeSchema = typeConversionToJSTypeSchema;
/**
 * Gets a copy of the target object with all properties converted.
 * @template F, T
 * @function
 * @param {Record<string, F>} source - value to be coverted
 * @param {(value: F) => T} convert - conversion function to be used
 * @returns {Record<string, F>} resulting copied value map
 */
function convertRecordValues(source, convert) {
    const results = {};
    for (const key in source) {
        results[key] = convert(source[key]);
    }
    return results;
}
exports.convertRecordValues = convertRecordValues;
/**
 * Handles conversion of a given value to a variety of types depending on the provided schema.
 * @class
 * @property {Record<string, TypedValueConvertor>} convertors - map of type specific conversion objects, keyed by type name
 */
class TypeConversionResolver {
    constructor(convertors = {}) {
        this.convertors = convertors;
    }
    /**
     * Tries to get the appropriate schema for resolving a given request.
     * @function
     * @param {TypeConversionRequest} request - conversion request to be used
     * @param {unknown} value - value to be converted
     * @param {TypeConversionContext | undefined} context - additional values to be used for resolving references
     * @returns {T} type conversion schema to use, if an appropriate one is found
     */
    getRequestSchema(request, value, context) {
        if (typeof request === 'object') {
            if ('anyOf' in request) {
                for (const item of request.anyOf) {
                    const schema = typeof item === 'object' ? item : { type: item };
                    const convertor = this.convertors[schema.type];
                    if (convertor?.matches(value)) {
                        return schema;
                    }
                }
                const firstItem = request.anyOf[0];
                if (firstItem != null) {
                    return typeof firstItem === 'object' ? firstItem : { type: firstItem };
                }
                return undefined;
            }
            if ('$ref' in request) {
                const resolvedRef = this.resolveReference(request, context);
                return 'anyOf' in resolvedRef
                    ? this.getRequestSchema(resolvedRef)
                    : resolvedRef;
            }
            return request;
        }
        return {
            type: request
        };
    }
    /**
     * Returns a TypeConversionContext with the provided schema as the parent.
     * @function
     * @param {TypeConversionSchema} parent - schema to set as the parent
     * @param {TypeConversionContext | undefined} base - source of default context values
     * @returns {T} resulting subcontext
     */
    getChildContext(parent, base) {
        if (base != null) {
            const context = { ...base };
            context.parent = parent;
            return context;
        }
        return {
            schemas: {},
            parent
        };
    }
    /**
     * Resolves a schema reference to the indicated schema.
     * @function
     * @param {JSTypeSchemaReference} reference - reference to be resolved
     * @param {TypeConversionContext | undefined} context - additional values to be used for resolving references
     * @param {TypeConversionSchema} defaultSchema - schema to be used if reference is unresolved
     * @returns {T} converted value
     */
    resolveReference(reference, context, defaultSchema = { type: JSType_1.JSTypeName.ANY }) {
        if (context?.schemas != null) {
            const schema = context.schemas[reference.$ref];
            if (schema != null) {
                return schema;
            }
        }
        if (context?.parent?.$defs != null) {
            const steps = reference.$ref.split('/');
            if (steps[0] === '#' && steps[1] === '$defs') {
                const schemaKey = steps[2];
                const schema = context.parent.$defs[schemaKey];
                if (schema != null) {
                    return schema;
                }
            }
        }
        return defaultSchema;
    }
    /**
     * Converts the provided value as specified by a conversion request.
     * @function
     * @param {unknown} value - value to be converted
     * @param {TypeConversionRequest} castAs - details what the value should be converted to
     * @param {TypeConversionContext | undefined} context - additional values to be used for resolving references
     * @returns {unknown} converted value
     */
    convert(value, castAs, context) {
        const schema = this.getRequestSchema(castAs, value, context);
        if (schema != null) {
            const convertor = this.convertors[schema.type];
            if (convertor != null) {
                return convertor.convertWith(value, schema, this, context);
            }
        }
    }
    /**
     * Updates all subschemas of the provided schema to reflect all effects of applying said subschemas.
     * This can also be used to convert a string request to a full schema.
     * @function
     * @param {TypeConversionRequest} source - request to be evaluated
     * @returns {T} resulting expanded schema, union, or reference
     */
    getExpandedSchema(source) {
        if (typeof source === 'string') {
            return { type: source };
        }
        if ('anyOf' in source) {
            const union = { ...source };
            union.anyOf = union.anyOf.map(item => this.getExpandedSchema(item));
            return union;
        }
        if ('$ref' in source) {
            return source;
        }
        const schema = { ...source };
        const convertor = this.convertors[schema.type];
        if (convertor?.expandSchema != null) {
            convertor.expandSchema(schema, this);
        }
        return schema;
    }
}
exports.TypeConversionResolver = TypeConversionResolver;
