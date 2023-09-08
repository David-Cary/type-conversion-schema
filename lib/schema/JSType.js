"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stringToJSTypeName = exports.createBasicSchema = exports.getExtendedTypeOf = exports.getTypedValueRecord = exports.getTypedArray = exports.initTypedJSONSchema = exports.initJSONSchema = exports.JSTypeToJSONSchema = exports.JSON_SCHEMA_TYPE_NAMES = exports.JSTypeName = void 0;
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
exports.JSON_SCHEMA_TYPE_NAMES = [
    'string',
    'number',
    'integer',
    'object',
    'array',
    'boolean',
    'null'
];
function JSTypeToJSONSchema(source) {
    const schema = {};
    if ('type' in source) {
        if (source.type === 'any')
            return true;
        if (!exports.JSON_SCHEMA_TYPE_NAMES.includes(source.type)) {
            return undefined;
        }
        initJSONSchema(source, schema);
        schema.type = source.type;
        switch (source.type) {
            case 'boolean': {
                initTypedJSONSchema(source, schema);
                break;
            }
            case 'bigint':
            case 'number': {
                initTypedJSONSchema(source, schema);
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
                initTypedJSONSchema(source, schema);
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
                initTypedJSONSchema(source, schema);
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
                initTypedJSONSchema(source, schema);
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
        initJSONSchema(source, schema);
        const anyOf = getTypedArray(source.anyOf, item => JSTypeToJSONSchema(item));
        if (anyOf != null) {
            schema.anyOf = anyOf;
        }
    }
    return schema;
}
exports.JSTypeToJSONSchema = JSTypeToJSONSchema;
function initJSONSchema(source, schema) {
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
            schema.$defs = getTypedValueRecord(source.$defs, item => JSTypeToJSONSchema(item));
        }
    }
}
exports.initJSONSchema = initJSONSchema;
function initTypedJSONSchema(source, schema) {
    if ('default' in source)
        schema.default = source.default;
    if ('examples' in source)
        schema.examples = source.examples;
    if ('const' in source)
        schema.const = source.const;
}
exports.initTypedJSONSchema = initTypedJSONSchema;
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
function getExtendedTypeOf(value) {
    if (value === null)
        return JSTypeName.NULL;
    if (Array.isArray(value))
        return JSTypeName.ARRAY;
    return typeof value;
}
exports.getExtendedTypeOf = getExtendedTypeOf;
function createBasicSchema(type) {
    const schema = { type };
    return schema;
}
exports.createBasicSchema = createBasicSchema;
function stringToJSTypeName(source) {
    for (const key in JSTypeName) {
        const value = JSTypeName[key];
        if (value === source)
            return value;
    }
    return JSTypeName.ANY;
}
exports.stringToJSTypeName = stringToJSTypeName;
