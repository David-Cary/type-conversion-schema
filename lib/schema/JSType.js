"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JSTypeRecordToJSONSchema = exports.JSTypeArrayToJSONSchema = exports.JSTypeToJSONSchema = exports.JSON_SCHEMA_TYPE_NAMES = void 0;
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
    let schema = {};
    if ('type' in source) {
        if (source.type === 'any')
            return true;
        if (!exports.JSON_SCHEMA_TYPE_NAMES.includes(source.type)) {
            return undefined;
        }
        schema.type = source.type;
    }
    else if ('anyOf' in source) {
        const anyOf = JSTypeArrayToJSONSchema(source.anyOf);
        if (anyOf != null) {
            schema.anyOf = anyOf;
        }
    }
    if (source.$comment != null)
        schema.$comment = source.$comment;
    if (source.$id != null)
        schema.$id = source.$id;
    if (source.$ref != null)
        schema.$ref = source.$ref;
    if (source.$schema != null)
        schema.$schema = source.$schema;
    if (source.description != null)
        schema.description = source.description;
    if (source.title != null)
        schema.title = source.title;
    if (source.definitions != null)
        schema.definitions = JSTypeRecordToJSONSchema(source.definitions);
    if ('default' in source)
        schema.default = source.default;
    if ('examples' in source)
        schema.examples = source.examples;
    if ('const' in source)
        schema.const = source.const;
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
        schema.prefixItems = JSTypeArrayToJSONSchema(source.prefixItems);
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
        schema.patternProperties = JSTypeRecordToJSONSchema(source.patternProperties);
    }
    if ('properties' in source && source.properties != null) {
        schema.properties = JSTypeRecordToJSONSchema(source.properties);
    }
    if ('propertyNames' in source && source.propertyNames != null) {
        schema.propertyNames = JSTypeToJSONSchema(source.propertyNames);
    }
    if ('required' in source)
        schema.required = source.required;
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
    return schema;
}
exports.JSTypeToJSONSchema = JSTypeToJSONSchema;
function JSTypeArrayToJSONSchema(source) {
    const conversions = source.map(item => JSTypeToJSONSchema(item));
    const filtered = conversions.filter(item => item != null);
    return filtered;
}
exports.JSTypeArrayToJSONSchema = JSTypeArrayToJSONSchema;
function JSTypeRecordToJSONSchema(source) {
    let results = {};
    for (const key in source) {
        const sourceSchema = source[key];
        const targetSchema = JSTypeToJSONSchema(sourceSchema);
        if (targetSchema != null) {
            results[key] = targetSchema;
        }
    }
    return results;
}
exports.JSTypeRecordToJSONSchema = JSTypeRecordToJSONSchema;
