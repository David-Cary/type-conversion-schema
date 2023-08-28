"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypeConversionResolver = exports.removeTypeConversionActionsFrom = exports.parseTypeConversionRequest = void 0;
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
    createJSTypeSchema(source) {
        if (typeof source === 'object') {
            if ('anyOf' in source) {
                const union = {
                    anyOf: []
                };
                for (const item of source.anyOf) {
                    const subschema = this.createJSTypeSchema(item);
                    if (subschema != null && 'type' in subschema) {
                        union.anyOf.push(subschema);
                    }
                }
                return union;
            }
            const sourceSchema = typeof source === 'object' ? source : { type: source };
            if (sourceSchema != null) {
                const convertor = this.convertors[sourceSchema.type];
                if (convertor != null) {
                    return convertor.createJSTypeSchema(sourceSchema, this);
                }
            }
        }
        else {
            return this.createJSTypeSchema({ type: source });
        }
    }
}
exports.TypeConversionResolver = TypeConversionResolver;
