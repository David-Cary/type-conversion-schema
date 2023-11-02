"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stringToJSTypeName = exports.createBasicSchema = exports.getExtendedTypeOf = exports.getTypedValueRecord = exports.getTypedArray = exports.initTypedJSONSchema = exports.initJSONSchema = exports.JSTypeToJSONSchema = exports.JSON_SCHEMA_TYPE_NAMES = exports.getEnumAsSchema = exports.getValueAsSchema = exports.getJSTypeSchemaUnionProperties = exports.getJSTypeSchemas = exports.JSTypeName = exports.getSymbolSchemaProperties = exports.getStringSchemaProperties = exports.JSONSchemaContentEncoding = exports.getObjectSchemaProperties = exports.getFunctionSchemaProperties = exports.getArraySchemaProperties = exports.getNumericJSTypeProperties = exports.getVariedJSTypeProperties = exports.getTypedJSTypeProperties = exports.getAbstractJSTypeProperties = exports.getOptionalPropertySchema = void 0;
/**
 * Helper function used to generate schema for optional properties
 * @function
 * @param {JSTypeSchema} options - acceptable types other than undefined
 * @returns {string} resulting schema
 */
function getOptionalPropertySchema(options) {
    options.push({ type: 'undefined' });
    return {
        anyOf: options
    };
}
exports.getOptionalPropertySchema = getOptionalPropertySchema;
/**
 * Helper function to get the schemas for each property of the AbstractJSTypeSchema interface.
 * @function
 * @returns {string} map of interface's property schemas
 */
function getAbstractJSTypeProperties() {
    return {
        $comment: getOptionalPropertySchema([{ type: 'string' }]),
        $id: getOptionalPropertySchema([{ type: 'string' }]),
        $defs: getOptionalPropertySchema([
            {
                type: 'object',
                additionalProperties: {
                    anyOf: [
                        { $ref: 'BasicJSTypeSchema' },
                        { $ref: 'JSTypeSchemaUnion' }
                    ]
                }
            }
        ]),
        $schema: getOptionalPropertySchema([{ type: 'string' }]),
        $anchor: getOptionalPropertySchema([{ type: 'string' }]),
        description: getOptionalPropertySchema([{ type: 'string' }]),
        title: getOptionalPropertySchema([{ type: 'string' }])
    };
}
exports.getAbstractJSTypeProperties = getAbstractJSTypeProperties;
/**
 * Helper function to get the schemas for each property of a particular TypedJSTypeSchema.
 * @function
 * @param (string) type - type name of t
 * @returns {string} map of interface's property schemas
 */
function getTypedJSTypeProperties(type) {
    const results = getAbstractJSTypeProperties();
    results.type = {
        type: 'string',
        const: type
    };
    return results;
}
exports.getTypedJSTypeProperties = getTypedJSTypeProperties;
/**
 * Helper function to get the schemas for each property of a particular VariedJSTypeSchema.
 * @function
 * @returns {string} map of interface's property schemas
 */
function getVariedJSTypeProperties(type) {
    const results = getTypedJSTypeProperties(type);
    const typeName = stringToJSTypeName(type);
    results.default = getOptionalPropertySchema([{ type: typeName }]);
    results.examples = getOptionalPropertySchema([
        {
            type: 'array',
            additionalItems: { type: typeName }
        }
    ]);
    results.const = getOptionalPropertySchema([{ type: typeName }]);
    return results;
}
exports.getVariedJSTypeProperties = getVariedJSTypeProperties;
/**
 * Helper function to get the schemas for each property of a particular NumericJSTypeSchema.
 * @function
 * @returns {Record<string, JSTypeSchema>} map of interface's property schemas
 */
function getNumericJSTypeProperties(type) {
    const results = getVariedJSTypeProperties(type);
    const typeName = stringToJSTypeName(type);
    results.integer = getOptionalPropertySchema([{ type: 'boolean' }]);
    results.exclusiveMaximum = getOptionalPropertySchema([{ type: typeName }]);
    results.exclusiveMinimum = getOptionalPropertySchema([{ type: typeName }]);
    results.maximum = getOptionalPropertySchema([{ type: typeName }]);
    results.minimum = getOptionalPropertySchema([{ type: typeName }]);
    results.multipleOf = getOptionalPropertySchema([{ type: typeName }]);
    return results;
}
exports.getNumericJSTypeProperties = getNumericJSTypeProperties;
/**
 * Helper function to get the schemas for each property of an ArraySchema.
 * @function
 * @returns {Record<string, JSTypeSchema>} map of interface's property schemas
 */
function getArraySchemaProperties() {
    const results = getVariedJSTypeProperties('array');
    results.additionalItems = getOptionalPropertySchema([{ $ref: 'JSTypeSchema' }]);
    results.contains = getOptionalPropertySchema([{ $ref: 'JSTypeSchema' }]);
    results.items = getOptionalPropertySchema([{ $ref: 'JSTypeSchema' }]);
    results.prefixItems = getOptionalPropertySchema([
        {
            type: 'array',
            additionalItems: { $ref: 'JSTypeSchema' }
        }
    ]);
    results.maxItems = getOptionalPropertySchema([{ type: 'number' }]);
    results.minItems = getOptionalPropertySchema([{ type: 'number' }]);
    results.uniqueItems = getOptionalPropertySchema([{ type: 'boolean' }]);
    return results;
}
exports.getArraySchemaProperties = getArraySchemaProperties;
/**
 * Helper function to get the schemas for each property of a FunctionSchem.
 * @function
 * @returns {Record<string, JSTypeSchema>} map of interface's property schemas
 */
function getFunctionSchemaProperties() {
    const results = getVariedJSTypeProperties('function');
    results.parameters = getOptionalPropertySchema([
        {
            type: 'array',
            additionalItems: { $ref: 'JSTypeSchema' }
        }
    ]);
    results.optionalParameters = getOptionalPropertySchema([
        {
            type: 'array',
            additionalItems: { $ref: 'JSTypeSchema' }
        }
    ]);
    results.additionalParameters = getOptionalPropertySchema([{ $ref: 'JSTypeSchema' }]);
    results.returns = getOptionalPropertySchema([{ $ref: 'JSTypeSchema' }]);
    return results;
}
exports.getFunctionSchemaProperties = getFunctionSchemaProperties;
/**
 * Helper function to get the schemas for each property of an ObjectSchema.
 * @function
 * @returns {Record<string, JSTypeSchema>} map of interface's property schemas
 */
function getObjectSchemaProperties() {
    const results = getVariedJSTypeProperties('object');
    results.additionalProperties = getOptionalPropertySchema([{ $ref: 'JSTypeSchema' }]);
    results.maxProperties = getOptionalPropertySchema([{ type: 'number' }]);
    results.minProperties = getOptionalPropertySchema([{ type: 'number' }]);
    results.patternProperties = getOptionalPropertySchema([
        {
            type: 'object',
            additionalProperties: { $ref: 'JSTypeSchema' }
        }
    ]);
    results.properties = getOptionalPropertySchema([
        {
            type: 'object',
            additionalProperties: { $ref: 'JSTypeSchema' }
        }
    ]);
    results.propertyNames = getOptionalPropertySchema([{ $ref: 'StringSchema' }]);
    results.required = getOptionalPropertySchema([
        {
            type: 'array',
            additionalItems: { type: 'string' }
        }
    ]);
    return results;
}
exports.getObjectSchemaProperties = getObjectSchemaProperties;
var JSONSchemaContentEncoding;
(function (JSONSchemaContentEncoding) {
    JSONSchemaContentEncoding["SEVENT_BIT"] = "7bit";
    JSONSchemaContentEncoding["EIGHT_BIT"] = "8bit";
    JSONSchemaContentEncoding["BASE64"] = "base64";
    JSONSchemaContentEncoding["BINARY"] = "binary";
    JSONSchemaContentEncoding["IETF_TOKEN"] = "ietf-token";
    JSONSchemaContentEncoding["QUOTED_PRINTABLE"] = "quoted-printable";
    JSONSchemaContentEncoding["X_TOKEN"] = "x-token";
})(JSONSchemaContentEncoding || (exports.JSONSchemaContentEncoding = JSONSchemaContentEncoding = {}));
/**
 * Helper function to get the schemas for each property of a StringSchema.
 * @function
 * @returns {Record<string, JSTypeSchema>} map of interface's property schemas
 */
function getStringSchemaProperties() {
    const results = getVariedJSTypeProperties('object');
    results.contentEncoding = getEnumAsSchema(JSONSchemaContentEncoding);
    results.contentEncoding.anyOf.push({ type: 'undefined' });
    results.contentMediaType = getOptionalPropertySchema([{ type: 'string' }]);
    results.format = getOptionalPropertySchema([{ type: 'string' }]);
    results.maxLength = getOptionalPropertySchema([{ type: 'number' }]);
    results.minLength = getOptionalPropertySchema([{ type: 'number' }]);
    results.pattern = getOptionalPropertySchema([{ type: 'string' }]);
    return results;
}
exports.getStringSchemaProperties = getStringSchemaProperties;
/**
 * Helper function to get the schemas for each property of a SymbolSchema.
 * @function
 * @returns {Record<string, JSTypeSchema>} map of interface's property schemas
 */
function getSymbolSchemaProperties() {
    const results = getTypedJSTypeProperties('symbol');
    results.key = getOptionalPropertySchema([{ type: 'string' }]);
    return results;
}
exports.getSymbolSchemaProperties = getSymbolSchemaProperties;
var JSTypeName;
(function (JSTypeName) {
    JSTypeName["ANY"] = "any";
    JSTypeName["ARRAY"] = "array";
    JSTypeName["BIG_INT"] = "bigint";
    JSTypeName["BOOLEAN"] = "boolean";
    JSTypeName["FUNCTION"] = "function";
    JSTypeName["NUMBER"] = "number";
    JSTypeName["NULL"] = "null";
    JSTypeName["OBJECT"] = "object";
    JSTypeName["STRING"] = "string";
    JSTypeName["SYMBOL"] = "symbol";
    JSTypeName["UNDEFINED"] = "undefined";
})(JSTypeName || (exports.JSTypeName = JSTypeName = {}));
/**
 * Converts an enum to a JS type schema,
 * @function
 * @returns {JSTypeSchemaUnion} resulting schema
 */
function getJSTypeSchemas(source) {
    return {
        AnySchema: {
            type: 'object',
            properties: getVariedJSTypeProperties('any')
        },
        ArraySchema: {
            type: 'object',
            properties: getArraySchemaProperties()
        },
        BigIntSchema: {
            type: 'object',
            properties: getNumericJSTypeProperties('bigint')
        },
        BooleanSchema: {
            type: 'object',
            properties: getVariedJSTypeProperties('boolean')
        },
        FunctionSchema: {
            type: 'object',
            properties: getFunctionSchemaProperties()
        },
        NumberSchema: {
            type: 'object',
            properties: getNumericJSTypeProperties('number')
        },
        NullSchema: {
            type: 'object',
            properties: getTypedJSTypeProperties('null')
        },
        ObjectSchema: {
            type: 'object',
            properties: getObjectSchemaProperties()
        },
        StringSchema: {
            type: 'object',
            properties: getStringSchemaProperties()
        },
        SymbolSchema: {
            type: 'object',
            properties: getSymbolSchemaProperties()
        },
        UndefinedSchema: {
            type: 'object',
            properties: getTypedJSTypeProperties('undefined')
        },
        JSTypeSchemaReference: {
            type: 'object',
            properties: {
                $ref: { type: 'string' }
            }
        },
        JSTypeSchemaUnion: {
            type: 'object',
            properties: getJSTypeSchemaUnionProperties()
        },
        BasicJSTypeSchema: {
            anyOf: [
                { $ref: 'AnySchema' },
                { $ref: 'ArraySchema' },
                { $ref: 'BigIntSchema' },
                { $ref: 'BooleanSchema' },
                { $ref: 'FunctionSchem' },
                { $ref: 'NumberSchema' },
                { $ref: 'NullSchema' },
                { $ref: 'ObjectSchema' },
                { $ref: 'StringSchema' },
                { $ref: 'SymbolSchema' },
                { $ref: 'UndefinedSchema' },
            ]
        },
        JSTypeSchema: {
            anyOf: [
                { $ref: 'BasicJSTypeSchema' },
                { $ref: 'JSTypeSchemaUnion' },
                { $ref: 'JSTypeSchemaReference' },
            ]
        }
    };
}
exports.getJSTypeSchemas = getJSTypeSchemas;
/**
 * Helper function to get the schemas for each property of a particular TypedJSTypeSchema.
 * @function
 * @returns {string} map of interface's property schemas
 */
function getJSTypeSchemaUnionProperties() {
    const results = getAbstractJSTypeProperties();
    results.anyOf = {
        type: 'array',
        additionalItems: {
            $ref: 'JSTypeSchema'
        }
    };
    return results;
}
exports.getJSTypeSchemaUnionProperties = getJSTypeSchemaUnionProperties;
/**
 * Converts a javascript value to it's corresponding schema,
 * @function
 * @param {any} source - value to be coverted
 * @returns {BasicJSTypeSchema} resulting schema
 */
function getValueAsSchema(source) {
    const type = typeof source;
    switch (type) {
        case 'undefined': {
            return { type };
        }
        case 'object': {
            if (source == null) {
                return { type: 'null' };
            }
            return {
                type: Array.isArray(source) ? 'array' : 'object',
                const: source
            };
        }
        case 'bigint':
        case 'boolean':
        case 'number':
        case 'string': {
            return {
                type,
                const: source
            };
        }
        case 'function': {
            return { type };
        }
        case 'symbol': {
            const schema = { type };
            const key = Symbol.keyFor(source);
            if (key != null) {
                schema.key = key;
            }
            return schema;
        }
        default: {
            return {
                type: 'any',
                const: source
            };
        }
    }
}
exports.getValueAsSchema = getValueAsSchema;
/**
 * Converts an enum to a JS type schema,
 * @function
 * @param {Record<string, any>} source - enum to be converted
 * @returns {JSTypeSchemaUnion} resulting schema
 */
function getEnumAsSchema(source) {
    const schema = { anyOf: [] };
    for (const key in source) {
        const option = getValueAsSchema(source[key]);
        option.title = key;
        schema.anyOf.push(option);
    }
    return schema;
}
exports.getEnumAsSchema = getEnumAsSchema;
exports.JSON_SCHEMA_TYPE_NAMES = [
    'string',
    'number',
    'integer',
    'object',
    'array',
    'boolean',
    'null'
];
/**
 * Tries to convert a javascript type schema to a JSON shema.
 * @function
 * @param {JSTypeSchema} source - javascript type schema to be coverted.
 * @returns {JSONSchema | undefined} resulting JSON schema, provided such a conversion is possible
 */
function JSTypeToJSONSchema(source) {
    const schema = {};
    if ('type' in source) {
        if (source.type === 'any')
            return true;
        if (!exports.JSON_SCHEMA_TYPE_NAMES.includes(source.type)) {
            return undefined;
        }
        initJSONSchema(schema, source);
        schema.type = source.type;
        switch (source.type) {
            case 'boolean': {
                initTypedJSONSchema(schema, source);
                break;
            }
            case 'bigint':
            case 'number': {
                initTypedJSONSchema(schema, source);
                schema.type = source.integer === true ? 'integer' : 'number';
                if ('exclusiveMaximum' in source)
                    schema.exclusiveMaximum = Number(source.exclusiveMaximum);
                if ('exclusiveMinimum' in source)
                    schema.exclusiveMinimum = Number(source.exclusiveMinimum);
                if ('maximum' in source)
                    schema.maximum = Number(source.maximum);
                if ('minimum' in source)
                    schema.minimum = Number(source.minimum);
                if ('multipleOf' in source)
                    schema.multipleOf = Number(source.multipleOf);
                break;
            }
            case 'string': {
                initTypedJSONSchema(schema, source);
                if ('contentEncoding' in source)
                    schema.contentEncoding = source.contentEncoding;
                if ('contentMediaType' in source)
                    schema.contentMediaType = source.contentMediaType;
                if ('format' in source)
                    schema.format = source.format;
                if ('maxLength' in source)
                    schema.maxLength = source.maxLength;
                if ('minLength' in source)
                    schema.minLength = source.minLength;
                if ('pattern' in source)
                    schema.pattern = source.pattern;
                break;
            }
            case 'array': {
                initTypedJSONSchema(schema, source);
                if ('additionalItems' in source && source.additionalItems != null) {
                    const converted = JSTypeToJSONSchema(source.additionalItems);
                    if (converted != null)
                        schema.additionalItems = converted;
                }
                if ('items' in source && source.items != null) {
                    const converted = JSTypeToJSONSchema(source.items);
                    if (converted != null)
                        schema.contains = converted;
                }
                if ('prefixItems' in source && source.prefixItems != null) {
                    schema.prefixItems = getTypedArray(source.prefixItems, item => JSTypeToJSONSchema(item));
                }
                if ('contains' in source && source.contains != null) {
                    const converted = JSTypeToJSONSchema(source.contains);
                    if (converted != null)
                        schema.contains = converted;
                }
                if ('maxItems' in source)
                    schema.maxItems = source.maxItems;
                if ('minItems' in source)
                    schema.minItems = source.minItems;
                if ('uniqueItems' in source)
                    schema.uniqueItems = source.uniqueItems;
                break;
            }
            case 'object': {
                initTypedJSONSchema(schema, source);
                if ('additionalProperties' in source && source.additionalProperties != null) {
                    const converted = JSTypeToJSONSchema(source.additionalProperties);
                    if (converted != null)
                        schema.additionalProperties = converted;
                }
                if ('maxProperties' in source)
                    schema.maxProperties = source.maxProperties;
                if ('minProperties' in source)
                    schema.minProperties = source.minProperties;
                if ('patternProperties' in source && source.patternProperties != null) {
                    schema.patternProperties = getTypedValueRecord(source.patternProperties, item => JSTypeToJSONSchema(item));
                }
                if ('properties' in source && source.properties != null) {
                    schema.properties = getTypedValueRecord(source.properties, item => JSTypeToJSONSchema(item));
                }
                if ('propertyNames' in source && source.propertyNames != null) {
                    schema.propertyNames = JSTypeToJSONSchema(source.propertyNames);
                }
                if ('required' in source)
                    schema.required = source.required;
                break;
            }
        }
    }
    else if ('anyOf' in source) {
        initJSONSchema(schema, source);
        const anyOf = getTypedArray(source.anyOf, item => JSTypeToJSONSchema(item));
        if (anyOf != null) {
            schema.anyOf = anyOf;
        }
    }
    return schema;
}
exports.JSTypeToJSONSchema = JSTypeToJSONSchema;
/**
 * Copies AbstractJSTypeSchema properties onto a JSON schema.
 * @function
 * @param {JSONSchemaObject} shema - JSON schema we're modifying
 * @param {JSTypeSchema} source - javascript type schema we're copying
 */
function initJSONSchema(schema, source) {
    if ('$ref' in source) {
        schema.$ref = source.$ref;
    }
    else {
        if (source.$comment != null)
            schema.$comment = source.$comment;
        if (source.$id != null)
            schema.$id = source.$id;
        if (source.$schema != null)
            schema.$schema = source.$schema;
        if (source.$anchor != null)
            schema.$anchor = source.$anchor;
        if (source.description != null)
            schema.description = source.description;
        if (source.title != null)
            schema.title = source.title;
        if (source.$defs != null) {
            schema.$defs = getTypedValueRecord(source.$defs, JSTypeToJSONSchema);
        }
    }
}
exports.initJSONSchema = initJSONSchema;
/**
 * Copies VariedJSTypeSchema specific properties onto a JSON schema.
 * @function
 * @param {JSONSchemaObject} shema - JSON schema we're modifying
 * @param {JSTypeSchema} source - javascript type schema we're copying
 */
function initTypedJSONSchema(schema, source) {
    if ('default' in source)
        schema.default = source.default;
    if ('examples' in source)
        schema.examples = source.examples;
    if ('const' in source)
        schema.const = source.const;
}
exports.initTypedJSONSchema = initTypedJSONSchema;
/**
 * Tries to map array items to a new type while filtering out null/undefined values.
 * @template F, T
 * @function
 * @param {F[]} source - items to be converted
 * @param {(value: F) => T | undefined} convert - callback used to perform conversions
 * @returns {JSONSchema} list of successfully converted items.
 */
function getTypedArray(source, convert) {
    const results = [];
    for (const item of source) {
        const converted = convert(item);
        if (converted != null) {
            results.push(converted);
        }
    }
    return results;
}
exports.getTypedArray = getTypedArray;
/**
 * Tries to map object values to a new type while filtering out null/undefined values.
 * @template F, T
 * @function
 * @param {F[]} source - object to be converted
 * @param {(value: F) => T | undefined} convert - callback used to perform conversions
 * @returns {JSONSchema} map of successfully converted values.
 */
function getTypedValueRecord(source, convert) {
    const results = {};
    for (const key in source) {
        const value = source[key];
        const converted = convert(value);
        if (converted != null) {
            results[key] = converted;
        }
    }
    return results;
}
exports.getTypedValueRecord = getTypedValueRecord;
/**
 * Acts as variant of 'typeof' with special handling for null values and arrays.
 * @function
 * @param {any} value - value to be evaluated
 * @returns {JSTypeName} valid type name for the provided value
 */
function getExtendedTypeOf(value) {
    if (value === null)
        return JSTypeName.NULL;
    if (Array.isArray(value))
        return JSTypeName.ARRAY;
    return typeof value;
}
exports.getExtendedTypeOf = getExtendedTypeOf;
/**
 * Creates a javascript type shema from a type name.
 * @function
 * @param {JSTypeName} type - type name to be used
 * @returns {JSONSchema} resulting javascript type schema
 */
function createBasicSchema(type) {
    const schema = { type };
    return schema;
}
exports.createBasicSchema = createBasicSchema;
/**
 * Converts a string to it's corresponding javascript type name, defaulting to 'any'.
 * @function
 * @param {string} source - type string to be converted
 * @returns {JSONSchema} the provided string if it was a valid type or 'any' if it wasn't
 */
function stringToJSTypeName(source) {
    const cased = source.toLowerCase();
    for (const key in JSTypeName) {
        const value = JSTypeName[key];
        if (value === cased)
            return value;
    }
    return JSTypeName.ANY;
}
exports.stringToJSTypeName = stringToJSTypeName;
