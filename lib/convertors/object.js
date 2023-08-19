"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToObjectConvertor = exports.DEFAULT_OBJECT_ACTIONS = exports.SetNestedValueAction = exports.DeleteNestedValueAction = exports.CloneViaSpreadAction = exports.CreateSpecifiedObjectAction = exports.ModifyObjectPropertiesAction = exports.resolvePropertyConversion = exports.getPropertyConversionFrom = exports.getConversionRequestFrom = exports.getObjectFrom = void 0;
const actions_1 = require("./actions");
const JSON_1 = require("../schema/JSON");
const JSType_1 = require("../schema/JSType");
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
function getConversionRequestFrom(source) {
    if (typeof source === 'string')
        return source;
    if (typeof source === 'object' &&
        source != null &&
        ('type' in source || 'anyOf' in source)) {
        return source;
    }
}
exports.getConversionRequestFrom = getConversionRequestFrom;
function getPropertyConversionFrom(source) {
    const schema = {};
    if (typeof source === 'object' && source != null) {
        if ('from' in source && Array.isArray(source.from)) {
            schema.from = source.from.filter((value) => typeof value === 'string' || typeof value === 'number');
        }
        if ('as' in source) {
            schema.as = getConversionRequestFrom(source.as);
        }
        if ('default' in source) {
            schema.default = source.default;
        }
    }
    return schema;
}
exports.getPropertyConversionFrom = getPropertyConversionFrom;
function resolvePropertyConversion(source, key, schema, resolver) {
    let value = schema.from != null
        ? (0, actions_1.getNestedValue)(source, schema.from)
        : (0, actions_1.getNestedValue)(source, key);
    if (value === undefined && schema.default !== undefined) {
        value = (0, JSON_1.cloneJSON)(schema.default);
    }
    if (schema.as != null && resolver != null) {
        return resolver.convert(value, schema.as);
    }
    return value;
}
exports.resolvePropertyConversion = resolvePropertyConversion;
class ModifyObjectPropertiesAction {
    transform(value, options, resolver) {
        if (options != null) {
            this.initializeObjectProperties(value, options, value, resolver);
        }
        return value;
    }
    modifySchema(schema, options, resolver) {
        if (schema.type === 'object' && options != null) {
            this.initializeObjectSchema(schema, options, resolver);
        }
        return schema;
    }
    initializeObjectProperties(target, options, source = target, resolver) {
        const properties = this.getPropertyConversionMap(options.properties);
        for (const key in properties) {
            target[key] = resolvePropertyConversion(source, key, properties[key], resolver);
        }
        if (options.additionalProperties != null) {
            const patternProperties = this.getPropertyConversionMap(options.patternProperties);
            const additionalProperties = getPropertyConversionFrom(options.additionalProperties);
            const pick = Array.isArray(options.pick)
                ? options.pick.filter((value) => typeof value === 'string')
                : null;
            const omit = Array.isArray(options.omit)
                ? options.omit.filter((value) => typeof value === 'string')
                : [];
            for (const key in source) {
                if (pick != null) {
                    if (!pick.includes(key))
                        continue;
                }
                else if (omit.includes(key))
                    continue;
                if (key in target)
                    continue;
                let patternMatched = false;
                for (const pattern in patternProperties) {
                    const exp = new RegExp(pattern);
                    patternMatched = exp.test(key);
                    if (patternMatched) {
                        target[key] = resolvePropertyConversion(source, key, patternProperties[pattern], resolver);
                        break;
                    }
                }
                if (patternMatched)
                    continue;
                target[key] = resolvePropertyConversion(source, key, additionalProperties, resolver);
            }
        }
    }
    initializeObjectSchema(schema, options, resolver) {
        if (options.properties != null) {
            schema.properties = {};
            const properties = this.getPropertyConversionMap(options.properties);
            for (const key in properties) {
                const conversion = properties[key];
                schema.properties[key] = this.getPropertySchema(conversion.as, resolver);
            }
        }
        if (options.patternProperties != null) {
            schema.patternProperties = {};
            const properties = this.getPropertyConversionMap(options.patternProperties);
            for (const key in properties) {
                const conversion = properties[key];
                schema.patternProperties[key] = this.getPropertySchema(conversion.as, resolver);
            }
        }
        if (options.additionalProperties != null &&
            typeof options.additionalProperties === 'object' &&
            'as' in options.additionalProperties) {
            schema.additionalProperties = this.getPropertySchema(options.additionalProperties.as, resolver);
        }
    }
    getPropertyConversionMap(source) {
        const map = {};
        if (typeof source === 'object' && source != null) {
            if (Array.isArray(source)) {
                for (let i = 0; i < source.length; i++) {
                    const key = String(i);
                    map[key] = getPropertyConversionFrom(source[i]);
                }
            }
            else {
                for (const key in source) {
                    map[key] = getPropertyConversionFrom(source[key]);
                }
            }
        }
        return map;
    }
    getPropertySchema(source, resolver) {
        if (resolver != null) {
            const request = getConversionRequestFrom(source);
            if (request != null) {
                const schema = resolver.createJSTypeSchema(request);
                if (schema != null) {
                    return schema;
                }
            }
        }
        return { type: 'any' };
    }
}
exports.ModifyObjectPropertiesAction = ModifyObjectPropertiesAction;
class CreateSpecifiedObjectAction extends ModifyObjectPropertiesAction {
    transform(value, options, resolver) {
        const result = {};
        if (options != null) {
            this.initializeObjectProperties(result, options, value, resolver);
        }
        return result;
    }
    createSchema(options, resolver) {
        const schema = { type: 'object' };
        if (options != null) {
            this.initializeObjectSchema(schema, options, resolver);
        }
        return schema;
    }
}
exports.CreateSpecifiedObjectAction = CreateSpecifiedObjectAction;
class CloneViaSpreadAction {
    transform(value, options) {
        return { ...value };
    }
}
exports.CloneViaSpreadAction = CloneViaSpreadAction;
class DeleteNestedValueAction {
    transform(value, options) {
        if (options != null && 'path' in options) {
            const path = Array.isArray(options.path) ? options.path : [options.path];
            if (path.length > 0) {
                const parentPath = path.slice(0, -1);
                const collection = (0, actions_1.getNestedValue)(value, parentPath);
                if (typeof collection === 'object' && collection != null) {
                    const finalStep = path[path.length - 1];
                    if (Array.isArray(collection)) {
                        const index = Number(finalStep);
                        if (!isNaN(index)) {
                            collection.splice(index, 1);
                        }
                    }
                    else {
                        const key = String(finalStep);
                        /* eslint-disable @typescript-eslint/no-dynamic-delete */
                        delete collection[key];
                    }
                }
            }
        }
        return value;
    }
    modifySchema(schema, options) {
        if (schema.type === 'object' && typeof options?.key === 'string') {
            if (schema.properties != null) {
                if (options.key in schema.properties) {
                    /* eslint-disable @typescript-eslint/no-dynamic-delete */
                    delete schema.properties[options.key];
                }
            }
        }
        if (options != null && 'path' in options) {
            const path = Array.isArray(options.path) ? options.path : [options.path];
            if (path.length > 0) {
                const maxIndex = path.length - 1;
                if (maxIndex >= 0) {
                    let targetSchema = schema;
                    for (let i = 0; i < maxIndex; i++) {
                        if (targetSchema == null)
                            break;
                        const step = path[i];
                        targetSchema = this.getSubSchema(targetSchema, step);
                    }
                    if (targetSchema != null && 'type' in targetSchema) {
                        const finalKey = path[maxIndex];
                        switch (targetSchema.type) {
                            case JSType_1.JSTypeName.OBJECT: {
                                const objectSchema = targetSchema;
                                if (objectSchema.properties != null) {
                                    const stringKey = String(finalKey);
                                    /* eslint-disable @typescript-eslint/no-dynamic-delete */
                                    delete objectSchema.properties[stringKey];
                                }
                                break;
                            }
                            case JSType_1.JSTypeName.ARRAY: {
                                const arraySchema = targetSchema;
                                if (arraySchema.prefixItems != null) {
                                    const index = Number(finalKey);
                                    if (!isNaN(index)) {
                                        arraySchema.prefixItems.splice(index, 1);
                                    }
                                }
                                break;
                            }
                        }
                    }
                }
            }
        }
        return schema;
    }
    getSubSchema(source, key) {
        if ('type' in source) {
            switch (source.type) {
                case JSType_1.JSTypeName.OBJECT: {
                    const stringKey = String(key);
                    return (source.properties != null) ? source.properties[stringKey] : undefined;
                }
                case JSType_1.JSTypeName.ARRAY: {
                    const index = Number(key);
                    if (isNaN(index))
                        return undefined;
                    return (source.prefixItems != null) ? source.prefixItems[index] : undefined;
                }
            }
        }
    }
}
exports.DeleteNestedValueAction = DeleteNestedValueAction;
class SetNestedValueAction extends DeleteNestedValueAction {
    transform(value, options, resolver) {
        if (options != null && 'path' in options) {
            const path = Array.isArray(options.path) ? options.path : [options.path];
            if (path.length > 0) {
                const parentPath = path.slice(0, -1);
                const collection = (0, actions_1.getNestedValue)(value, parentPath);
                if (typeof collection === 'object' && collection != null) {
                    const finalStep = path[path.length - 1];
                    let targetValue = ('value' in options)
                        ? options.value
                        : (('from' in options)
                            ? (0, actions_1.getNestedValue)(value, options.from)
                            : (0, actions_1.getNestedValue)(collection, finalStep));
                    if (resolver != null) {
                        const castAs = this.getConversionRequestFrom(options.as);
                        if (castAs != null) {
                            targetValue = resolver.convert(targetValue, castAs);
                        }
                    }
                    if (Array.isArray(collection)) {
                        const index = Number(finalStep);
                        if (!isNaN(index)) {
                            collection[index] = targetValue;
                        }
                    }
                    else {
                        const key = String(finalStep);
                        collection[key] = targetValue;
                    }
                }
            }
        }
        return value;
    }
    getConversionRequestFrom(source) {
        if (typeof source === 'string')
            return source;
        if (typeof source === 'object' &&
            source != null &&
            ('type' in source || 'anyOf' in source)) {
            return source;
        }
    }
    modifySchema(schema, options, resolver) {
        if (options != null && 'path' in options) {
            let targetSchema = schema;
            const path = Array.isArray(options.path) ? options.path : [options.path];
            const maxIndex = path.length - 1;
            if (maxIndex >= 0) {
                for (let i = 0; i < maxIndex; i++) {
                    const step = path[i];
                    let nextSchema = this.getSubSchema(targetSchema, step);
                    if (nextSchema != null) {
                        targetSchema = nextSchema;
                    }
                    else {
                        nextSchema = this.createSubSchema(path[i + 1]);
                        if (nextSchema != null) {
                            this.setSubSchema(targetSchema, step, nextSchema);
                            targetSchema = nextSchema;
                        }
                        else {
                            return schema;
                        }
                    }
                }
                const finalStep = path[maxIndex];
                const valueSchema = this.createValueSchema(options, resolver);
                this.setSubSchema(targetSchema, finalStep, valueSchema);
            }
        }
        return schema;
    }
    setSubSchema(target, key, value) {
        if ('type' in target) {
            switch (target.type) {
                case JSType_1.JSTypeName.OBJECT: {
                    const stringKey = String(key);
                    if (target.properties == null) {
                        target.properties = {};
                    }
                    target.properties[stringKey] = value;
                    return;
                }
                case JSType_1.JSTypeName.ARRAY: {
                    const index = Number(key);
                    if (isNaN(index))
                        return;
                    if (target.prefixItems == null) {
                        target.prefixItems = [];
                    }
                    target.prefixItems[index] = value;
                }
            }
        }
    }
    createSubSchema(key) {
        switch (typeof key) {
            case 'string': {
                return { type: 'object' };
            }
            case 'number': {
                return { type: 'array' };
            }
        }
    }
    createValueSchema(options, resolver) {
        if (resolver != null) {
            const castAs = this.getConversionRequestFrom(options.as);
            if (castAs != null) {
                const resolved = resolver.createJSTypeSchema(castAs);
                if (resolved != null) {
                    return resolved;
                }
            }
        }
        if ('value' in options) {
            const type = (0, JSType_1.getExtendedTypeOf)(options.value);
            const schema = { type };
            return schema;
        }
        const schema = { type: JSType_1.JSTypeName.ANY };
        return schema;
    }
}
exports.SetNestedValueAction = SetNestedValueAction;
exports.DEFAULT_OBJECT_ACTIONS = {
    untyped: { ...actions_1.DEFAULT_UNTYPED_CONVERSIONS },
    conversion: {
        create: new CreateSpecifiedObjectAction()
    },
    typed: {
        clone: new CloneViaSpreadAction(),
        delete: new DeleteNestedValueAction(),
        modify: new ModifyObjectPropertiesAction(),
        set: new SetNestedValueAction()
    }
};
class ToObjectConvertor extends actions_1.TypedActionsValueConvertor {
    constructor(actions = exports.DEFAULT_OBJECT_ACTIONS) {
        super('object', getObjectFrom, actions);
    }
}
exports.ToObjectConvertor = ToObjectConvertor;
