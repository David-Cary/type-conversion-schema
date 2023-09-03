"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypeConversionResolver = exports.convertRecordValues = exports.typeConversionToJSTypeSchema = exports.removeTypeConversionActionsFrom = exports.parseTypeConversionRequest = void 0;
function parseTypeConversionRequest(request) {
    if (typeof request === 'string') {
        return { type: request };
    }
    return request;
}
exports.parseTypeConversionRequest = parseTypeConversionRequest;
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
    else {
        schema.anyOf = request.anyOf.map(option => typeConversionToJSTypeSchema(option));
    }
    return schema;
}
exports.typeConversionToJSTypeSchema = typeConversionToJSTypeSchema;
function convertRecordValues(source, convert) {
    const results = {};
    for (const key in source) {
        results[key] = convert(source[key]);
    }
    return results;
}
exports.convertRecordValues = convertRecordValues;
class TypeConversionResolver {
    constructor(convertors = {}) {
        this.convertors = convertors;
    }
    getRequestSchema(request, value) {
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
            return request;
        }
        return {
            type: request
        };
    }
    convert(value, castAs) {
        const schema = this.getRequestSchema(castAs, value);
        if (schema != null) {
            const convertor = this.convertors[schema.type];
            if (convertor != null) {
                return convertor.convertWith(value, schema, this);
            }
        }
    }
    getExpandedSchema(source) {
        if (typeof source === 'string') {
            return { type: source };
        }
        if ('anyOf' in source) {
            const union = { ...source };
            union.anyOf = union.anyOf.map(item => this.getExpandedSchema(item));
            return union;
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
