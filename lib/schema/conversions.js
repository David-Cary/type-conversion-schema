"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypeConversionResolver = exports.JSON_SCHEMA_TYPE_NAMES = void 0;
exports.JSON_SCHEMA_TYPE_NAMES = [
    'string',
    'number',
    'integer',
    'object',
    'array',
    'boolean',
    'null'
];
class TypeConversionResolver {
    constructor(convertors = {}) {
        this.convertors = convertors;
    }
    getRequestSchema(request, value) {
        if (typeof request === 'object') {
            if ('anyOf' in request) {
                for (const schema of request.anyOf) {
                    const convertor = this.convertors[schema.type];
                    if (convertor?.matches(value)) {
                        return schema;
                    }
                }
                return request.anyOf[0];
            }
            return request;
        }
        return {
            type: request,
            actions: []
        };
    }
    convert(value, castAs) {
        const schema = this.getRequestSchema(castAs, value);
        if (schema != null) {
            const convertor = this.convertors[schema.type];
            if (convertor != null) {
                return convertor.convertWith(value, schema.actions, this);
            }
        }
    }
    getExpandedSchema(source, allowedTypes) {
        if (typeof source === 'object') {
            if ('anyOf' in source) {
                const schemas = source.anyOf.map(item => this.getExpandedSchema(item, allowedTypes));
                return {
                    anyOf: schemas.filter(item => item != null)
                };
            }
            if (allowedTypes != null) {
                if (!allowedTypes.includes(source.type)) {
                    return undefined;
                }
            }
            const convertor = this.convertors[source.type];
            if (convertor != null) {
                const schema = {
                    type: source.type
                };
                for (const request of source.actions) {
                    const options = typeof request === 'object'
                        ? request
                        : { type: request };
                    const action = convertor.getAction(options.type);
                    if (action?.modifySchema != null) {
                        action.modifySchema(schema, options);
                    }
                }
                return schema;
            }
            return undefined;
        }
        return {
            type: source
        };
    }
    getJSONSchema(source) {
        const schema = this.getExpandedSchema(source, exports.JSON_SCHEMA_TYPE_NAMES);
        return schema != null ? schema : undefined;
    }
}
exports.TypeConversionResolver = TypeConversionResolver;
