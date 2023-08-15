"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypeConversionResolver = void 0;
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
