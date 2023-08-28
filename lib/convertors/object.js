"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToObjectConvertor = exports.DEFAULT_OBJECT_ACTIONS = exports.CreateWrapperObjectAction = exports.SetObjectPropertiesAction = exports.ModifyObjectPropertiesAction = exports.PickPropertiesAction = exports.OmitPropertiesAction = exports.getConversionRequestFrom = exports.getObjectFrom = void 0;
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
        return (0, JSType_1.stringToJSTypeName)(source);
    if (typeof source === 'object' &&
        source != null &&
        ('type' in source || 'anyOf' in source)) {
        return source;
    }
}
exports.getConversionRequestFrom = getConversionRequestFrom;
class OmitPropertiesAction {
    transform(value, options) {
        if (options != null && Array.isArray(options.properties)) {
            const results = {};
            for (const key in value) {
                if (!options.properties.includes(key)) {
                    results[key] = value[key];
                }
            }
            return results;
        }
        return { ...value };
    }
}
exports.OmitPropertiesAction = OmitPropertiesAction;
class PickPropertiesAction {
    transform(value, options) {
        if (options != null && Array.isArray(options.properties)) {
            const results = {};
            for (const key in value) {
                if (options.properties.includes(key)) {
                    results[key] = value[key];
                }
            }
            return results;
        }
        return {};
    }
}
exports.PickPropertiesAction = PickPropertiesAction;
class ModifyObjectPropertiesAction {
    transform(value, options, resolver) {
        if (options != null) {
            const schema = this.getObjectSchemaFrom(options);
            this.applySchemaTo(schema, value, resolver);
        }
        return value;
    }
    getObjectSchemaFrom(source) {
        const schema = { type: JSType_1.JSTypeName.OBJECT };
        if (typeof source.properties === 'object' &&
            source.properties != null &&
            !Array.isArray(source.properties)) {
            schema.properties = this.getSchemaMap(source.properties);
        }
        schema.additionalProperties = this.getSchemaFrom(source.additionalProperties);
        if (typeof source.patternProperties === 'object' &&
            source.patternProperties != null &&
            !Array.isArray(source.patternProperties)) {
            schema.patternProperties = this.getSchemaMap(source.patternProperties);
        }
        return schema;
    }
    getSchemaMap(source) {
        const map = {};
        for (const key in source) {
            const schema = this.getSchemaFrom(source[key]);
            if (schema != null) {
                map[key] = schema;
            }
        }
        return map;
    }
    getSchemaFrom(source) {
        if (typeof source === 'object' &&
            source != null &&
            !Array.isArray(source)) {
            if (typeof source.type === 'string' || Array.isArray(source.anyOf)) {
                return source;
            }
        }
    }
    applySchemaTo(schema, target, resolver) {
        const properties = ('properties' in schema && schema.properties != null)
            ? schema.properties
            : {};
        if (resolver != null) {
            for (const key in properties) {
                target[key] = resolver.convert(target[key], properties[key]);
            }
        }
        const additionalProperties = ('additionalProperties' in schema)
            ? schema.additionalProperties
            : undefined;
        const patternProperties = ('patternProperties' in schema && schema.patternProperties != null)
            ? schema.patternProperties
            : {};
        for (const key in target) {
            if (key in properties)
                continue;
            if (additionalProperties == null) {
                /* eslint-disable @typescript-eslint/no-dynamic-delete */
                delete target[key];
            }
            else if (resolver != null) {
                let patternMatched = false;
                for (const pattern in patternProperties) {
                    const exp = new RegExp(pattern);
                    patternMatched = exp.test(key);
                    if (patternMatched) {
                        target[key] = resolver.convert(target[key], patternProperties[pattern]);
                        break;
                    }
                }
                if (patternMatched)
                    continue;
                target[key] = resolver.convert(target[key], additionalProperties);
            }
        }
    }
}
exports.ModifyObjectPropertiesAction = ModifyObjectPropertiesAction;
class SetObjectPropertiesAction extends ModifyObjectPropertiesAction {
    transform(value, options, resolver) {
        if (options != null) {
            const schema = this.getObjectSchemaFrom(options);
            if (schema.additionalProperties == null) {
                schema.additionalProperties = { type: JSType_1.JSTypeName.ANY };
            }
            this.applySchemaTo(schema, value, resolver);
        }
        return value;
    }
}
exports.SetObjectPropertiesAction = SetObjectPropertiesAction;
class CreateWrapperObjectAction {
    transform(value, options) {
        if (options != null && Array.isArray(options.convert)) {
            const type = (0, JSType_1.getExtendedTypeOf)(value);
            if (options.convert.includes(type)) {
                return getObjectFrom(value);
            }
        }
        const key = options?.key != null ? String(options.key) : 'value';
        return { [key]: value };
    }
}
exports.CreateWrapperObjectAction = CreateWrapperObjectAction;
exports.DEFAULT_OBJECT_ACTIONS = {
    untyped: { ...actions_1.DEFAULT_UNTYPED_CONVERSIONS },
    conversion: {
        wrap: new CreateWrapperObjectAction()
    },
    typed: {
        modify: new ModifyObjectPropertiesAction(),
        omit: new OmitPropertiesAction(),
        pick: new PickPropertiesAction(),
        set: new SetObjectPropertiesAction()
    }
};
class ToObjectConvertor extends actions_1.TypedActionsValueConvertor {
    constructor(actions = exports.DEFAULT_OBJECT_ACTIONS, cloneVia = JSON_1.cloneJSON) {
        super('object', getObjectFrom, actions);
        this.mutator = new ModifyObjectPropertiesAction();
        this.clone = cloneVia;
    }
    prepareValue(value, schema, resolver) {
        if ('const' in schema && typeof schema.const === 'object') {
            return this.clone(schema.const);
        }
        value = super.prepareValue(value, schema, resolver);
        if (value == null &&
            'default' in schema &&
            typeof schema.default === 'object') {
            value = this.clone(schema.default);
        }
        return value;
    }
    finalizeValue(value, schema, resolver) {
        value = super.finalizeValue(value, schema, resolver);
        this.mutator.applySchemaTo(schema, value, resolver);
        return value;
    }
}
exports.ToObjectConvertor = ToObjectConvertor;
