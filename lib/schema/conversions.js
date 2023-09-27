"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.safeJSONStringify = exports.getSymbolFrom = exports.getObjectFrom = exports.getFunctionFrom = exports.getBigIntFrom = exports.getArrayFrom = exports.getValueKey = exports.initSymbolConversionSchemaFrom = exports.initStringConversionSchemaFrom = exports.initObjectConversionSchemaFrom = exports.initFunctionConversionSchemaFrom = exports.initArrayConversionSchemaFrom = exports.initNumericConversionSchemaFrom = exports.initVariedConversionSchemaFrom = exports.initAbstractConversionSchemaFrom = exports.getConversionSchemaFrom = exports.TypeConversionResolver = exports.getActionRequestFrom = exports.convertRecordValues = exports.typeConversionToJSTypeSchema = exports.removeTypeConversionActionsFrom = exports.parseTypeConversionRequest = void 0;
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
        if (request.$defs != null) {
            schema.$defs = convertRecordValues(request.$defs, typeConversionToJSTypeSchema);
        }
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
 * Tries to cast the provided value to an action request.
 * @function
 * @param {amy} source - value to be cast
 * @returns {any} recast value, if valid
 */
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
                    const schema = this.getRequestSchema(item, value, context);
                    if (schema == null)
                        continue;
                    const convertor = this.convertors[schema.type];
                    if (convertor?.matches(value)) {
                        return schema;
                    }
                }
                const firstItem = request.anyOf[0];
                return this.getRequestSchema(firstItem, value, context);
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
/**
 * Extracts a type convesion schema from the provided value.
 * @function
 * @param {any} source - value to draw the schema from
 * @returns {TypeConversionSchema | undefined} target schema, if any
 */
function getConversionSchemaFrom(source) {
    switch (typeof source) {
        case 'object': {
            if (Array.isArray(source)) {
                return {
                    anyOf: source.map(value => getConversionSchemaFrom(value))
                };
            }
            if ('$ref' in source) {
                return {
                    $ref: String(source.$ref)
                };
            }
            if ('anyOf' in source) {
                const schema = {
                    anyOf: source.map(getConversionSchemaFrom)
                };
                initAbstractConversionSchemaFrom(schema, source);
                return schema;
            }
            if ('type' in source) {
                const schema = {
                    type: (0, JSType_1.stringToJSTypeName)(String(source.type))
                };
                switch (source.type) {
                    case 'number': {
                        initNumericConversionSchemaFrom(schema, source, Number);
                        break;
                    }
                    case 'string': {
                        initStringConversionSchemaFrom(schema, source);
                        break;
                    }
                    case 'boolean': {
                        initVariedConversionSchemaFrom(schema, source, Boolean);
                        break;
                    }
                    case 'object': {
                        initObjectConversionSchemaFrom(schema, source);
                        break;
                    }
                    case 'array': {
                        initArrayConversionSchemaFrom(schema, source);
                        break;
                    }
                    case 'function': {
                        initFunctionConversionSchemaFrom(schema, source);
                        break;
                    }
                    case 'bigint': {
                        initNumericConversionSchemaFrom(schema, source, getBigIntFrom);
                        break;
                    }
                    case 'symbol': {
                        initSymbolConversionSchemaFrom(schema, source);
                        break;
                    }
                    default: {
                        initAbstractConversionSchemaFrom(schema, source);
                    }
                }
            }
            break;
        }
        case 'string': {
            const type = (0, JSType_1.stringToJSTypeName)(source);
            return { type };
        }
    }
    return { type: 'any' };
}
exports.getConversionSchemaFrom = getConversionSchemaFrom;
function initAbstractConversionSchemaFrom(schema, source) {
    if (source.$comment != null)
        schema.$comment = String(source.$comment);
    if (source.$id != null)
        schema.$id = String(source.$id);
    if (source.$schema != null)
        schema.$schema = String(source.$schema);
    if (source.$anchor != null)
        schema.$anchor = String(source.$anchor);
    if (source.description != null)
        schema.description = String(source.description);
    if (source.title != null)
        schema.title = String(source.title);
    if (typeof source.$defs === 'object' &&
        source.$defs != null &&
        !Array.isArray(source.$defs)) {
        schema.$defs = (0, JSType_1.getTypedValueRecord)(source.$defs, item => {
            const subschema = getConversionSchemaFrom(item);
            return subschema == null || '$ref' in subschema ? undefined : subschema;
        });
    }
}
exports.initAbstractConversionSchemaFrom = initAbstractConversionSchemaFrom;
function initVariedConversionSchemaFrom(schema, source, convert) {
    initAbstractConversionSchemaFrom(schema, source);
    if (source.default != null)
        schema.default = convert(source.default);
    if (source.const != null)
        schema.const = convert(source.const);
    if (Array.isArray(source.examples)) {
        schema.examples = (0, JSType_1.getTypedArray)(source.examples, item => item != null ? convert(item) : undefined);
    }
}
exports.initVariedConversionSchemaFrom = initVariedConversionSchemaFrom;
function initNumericConversionSchemaFrom(schema, source, convert) {
    initVariedConversionSchemaFrom(schema, source, convert);
    if (source.integer != null)
        schema.integer = Boolean(source.integer);
    if (source.minimum != null)
        schema.minimum = convert(source.minimum);
    if (source.maximum != null)
        schema.maximum = convert(source.maximum);
    if (source.exclusiveMinimum != null)
        schema.exclusiveMinimum = convert(source.exclusiveMinimum);
    if (source.exclusiveMaximum != null)
        schema.exclusiveMaximum = convert(source.exclusiveMaximum);
    if (source.multipleOf != null)
        schema.multipleOf = convert(source.multiple);
}
exports.initNumericConversionSchemaFrom = initNumericConversionSchemaFrom;
function initArrayConversionSchemaFrom(schema, source) {
    initVariedConversionSchemaFrom(schema, source, getArrayFrom);
    if (source.additionalItems != null) {
        schema.additionalItems = getConversionSchemaFrom(source.additionalItems);
    }
    if (source.contains != null) {
        schema.contains = getConversionSchemaFrom(source.contains);
    }
    if (source.items != null) {
        schema.items = getConversionSchemaFrom(source.items);
    }
    if (source.prefixItems != null) {
        schema.prefixItems = (0, JSType_1.getTypedArray)(source.prefixItems, getConversionSchemaFrom);
    }
    if (source.minItems != null)
        schema.minItems = Number(source.minItems);
    if (source.maxItems != null)
        schema.maxItems = Number(source.maxItems);
    if (source.uniqueItems != null)
        schema.uniqueItems = Boolean(source.uniqueItems);
}
exports.initArrayConversionSchemaFrom = initArrayConversionSchemaFrom;
function initFunctionConversionSchemaFrom(schema, source) {
    initVariedConversionSchemaFrom(schema, source, getFunctionFrom);
    if (source.parameters != null) {
        schema.parameters = (0, JSType_1.getTypedArray)(source.parameters, getConversionSchemaFrom);
    }
    if (source.optionalParameters != null) {
        schema.optionalParameters = (0, JSType_1.getTypedArray)(source.optionalParameters, getConversionSchemaFrom);
    }
    if (source.additionalParameters != null) {
        schema.additionalParameters = getConversionSchemaFrom(source.additionalParameters);
    }
    if (source.returns != null) {
        schema.returns = getConversionSchemaFrom(source.returns);
    }
}
exports.initFunctionConversionSchemaFrom = initFunctionConversionSchemaFrom;
function initObjectConversionSchemaFrom(schema, source) {
    initVariedConversionSchemaFrom(schema, source, getObjectFrom);
    if (source.additionalProperties != null) {
        schema.additionalProperties = getConversionSchemaFrom(source.additionalProperties);
    }
    if (source.maxProperties != null)
        schema.maxProperties = Number(source.maxProperties);
    if (source.minProperties != null)
        schema.minProperties = Number(source.minProperties);
    if (source.patternProperties != null) {
        schema.patternProperties = (0, JSType_1.getTypedValueRecord)(source.patternProperties, getConversionSchemaFrom);
    }
    if (source.properties != null) {
        schema.properties = (0, JSType_1.getTypedValueRecord)(source.properties, getConversionSchemaFrom);
    }
    if (source.propertyNames != null) {
        schema.propertyNames = { type: JSType_1.JSTypeName.STRING };
        initStringConversionSchemaFrom(schema.propertyNames, source.propertyNames);
    }
    if (source.required != null) {
        schema.required = (0, JSType_1.getTypedArray)(source.required, String);
    }
}
exports.initObjectConversionSchemaFrom = initObjectConversionSchemaFrom;
function initStringConversionSchemaFrom(schema, source) {
    initVariedConversionSchemaFrom(schema, source, String);
    if (source.contentEncoding != null) {
        const encoding = getValueKey(JSType_1.JSONSchemaContentEncoding, source.contentEncoding);
        if (encoding != null) {
            schema.contentEncoding = encoding;
        }
    }
    if (source.contentMediaType != null)
        schema.contentMediaType = String(source.contentMediaType);
    if (source.format != null)
        schema.format = String(source.format);
    if (source.maxLength != null)
        schema.maxLength = Number(source.maxLength);
    if (source.minLength != null)
        schema.minLength = Number(source.minLength);
    if (source.pattern != null)
        schema.pattern = String(source.pattern);
}
exports.initStringConversionSchemaFrom = initStringConversionSchemaFrom;
function initSymbolConversionSchemaFrom(schema, source) {
    initVariedConversionSchemaFrom(schema, source, getSymbolFrom);
    if (source.key != null)
        schema.key = String(source.key);
}
exports.initSymbolConversionSchemaFrom = initSymbolConversionSchemaFrom;
function getValueKey(collection, value) {
    for (const key in collection) {
        if (collection[key] === value) {
            return key;
        }
    }
}
exports.getValueKey = getValueKey;
/**
 * Converts the provided value to an array.
 * This involves wrapping non-array values in an array with undefined values excluded.
 * @function
 * @param {unknown} source - value to be converted
 * @returns {any[]} source array or enclosing array for non-array sources
 */
function getArrayFrom(source) {
    if (Array.isArray(source)) {
        return source;
    }
    return source !== undefined ? [source] : [];
}
exports.getArrayFrom = getArrayFrom;
/**
 * Converts the provided value to a BigInt.
 * This involves wrapping non-array values in an array with undefined values excluded.
 * @function
 * @param {unknown} source - value to be converted
 * @returns {any} source array or enclosing array for non-array sources
 */
function getBigIntFrom(value, defaultValue = 0n) {
    switch (typeof value) {
        case 'number':
        case 'string':
        case 'boolean': {
            return BigInt(value);
        }
        case 'bigint': {
            return value;
        }
    }
    return defaultValue;
}
exports.getBigIntFrom = getBigIntFrom;
/**
 * Converts the provided value to a function.
 * If the value isn't already a function it will be wrapped in a fuction that returns that value.
 * @function
 * @param {any} source - value to be converted
 * @returns {AnyFunction} resulting function
 */
function getFunctionFrom(value) {
    if (typeof value === 'function') {
        return value;
    }
    return () => value;
}
exports.getFunctionFrom = getFunctionFrom;
/**
 * Converts the provided value to an object.
 * For arrays, this means remapping items to keys that match their indices.
 * For strings, JSON parse is attempted.
 * Any other values or a failed parse result in an empty object.
 * @function
 * @param {any} source - value to be converted
 * @returns {string} resulting object
 */
function getObjectFrom(source) {
    switch (typeof source) {
        case 'object': {
            if (Array.isArray(source)) {
                const map = {};
                for (let i = 0; i < source.length; i++) {
                    map[String(i)] = source[i];
                }
                return map;
            }
            if (source != null)
                return source;
            break;
        }
        case 'string': {
            try {
                return JSON.parse(source);
            }
            catch (error) {
                return {};
            }
        }
    }
    return {};
}
exports.getObjectFrom = getObjectFrom;
function getSymbolFrom(value) {
    switch (typeof value) {
        case 'string': {
            return Symbol(value);
        }
        case 'symbol': {
            return value;
        }
    }
    const description = safeJSONStringify(value);
    return Symbol(description);
}
exports.getSymbolFrom = getSymbolFrom;
/**
 * Provides a fallback to failed JSON stringify attempts.
 * @function
 * @param {any} source - value to be converted
 * @param {StringifyReplacerCallback | Array<string | number> | null | undefined} replacer - replacer to pass in to JSON stringify.
 * @param {number | string} space - spacing value to be used by JSON stringify
 * @returns {string} resulting string
 */
function safeJSONStringify(source, replacer, space) {
    try {
        // Redundant, but appeases typescript.
        if (typeof replacer === 'function') {
            return JSON.stringify(source, replacer, space);
        }
        return JSON.stringify(source, replacer, space);
    }
    catch (error) {
        return String(source);
    }
}
exports.safeJSONStringify = safeJSONStringify;
