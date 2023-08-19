"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToArrayConvertor = exports.DEFAULT_ARRAY_ACTIONS = exports.CopyArrayAction = exports.CreateSpecifiedArrayAction = exports.ModifyArrayAction = exports.resolveIndexedConversion = exports.getArrayFrom = void 0;
const actions_1 = require("./actions");
const JSON_1 = require("../schema/JSON");
const object_1 = require("./object");
function getArrayFrom(source) {
    if (Array.isArray(source)) {
        return source;
    }
    return source !== undefined ? [source] : [];
}
exports.getArrayFrom = getArrayFrom;
function resolveIndexedConversion(source, index, schema, resolver) {
    let value = schema.from != null
        ? (0, actions_1.getNestedValue)(source, schema.from)
        : (0, actions_1.getNestedValue)(source, index);
    if (value === undefined && schema.default !== undefined) {
        value = (0, JSON_1.cloneJSON)(schema.default);
    }
    if (schema.as != null && resolver != null) {
        return resolver.convert(value, schema.as);
    }
    return value;
}
exports.resolveIndexedConversion = resolveIndexedConversion;
class ModifyArrayAction {
    transform(value, options, resolver) {
        if (options != null) {
            this.initializeArray(value, options, value, resolver);
        }
        return value;
    }
    modifySchema(schema, options, resolver) {
        if (schema.type === 'array' && options != null) {
            this.initializeArraySchema(schema, options, resolver);
        }
        return schema;
    }
    initializeArray(target, options, source = target, resolver) {
        const prefixItems = this.getPropertyConversions(options.prefixItems);
        for (let i = 0; i < prefixItems.length; i++) {
            target[i] = resolveIndexedConversion(source, i, prefixItems[i], resolver);
        }
        if (options.items != null) {
            const itemSchema = (0, object_1.getPropertyConversionFrom)(options.items);
            const uniqueItems = Boolean(options.uniqueItems);
            for (let i = prefixItems.length; i < source.length; i++) {
                const value = resolveIndexedConversion(source, i, itemSchema, resolver);
                if (uniqueItems && target.includes(value)) {
                    continue;
                }
                target[i] = value;
            }
        }
    }
    initializeArraySchema(schema, options, resolver) {
        if (options.prefixItems != null) {
            const prefixItems = this.getPropertyConversions(options.properties);
            schema.prefixItems = prefixItems.map(item => this.getItemSchema(item));
        }
        if (options.items != null &&
            typeof options.items === 'object' &&
            'as' in options.items) {
            schema.items = this.getItemSchema(options.items.as, resolver);
        }
        if ('uniqueItems' in options) {
            schema.uniqueItems = Boolean(options.uniqueItems);
        }
    }
    getPropertyConversions(source) {
        if (typeof source === 'object' && source != null) {
            if (Array.isArray(source)) {
                return source.map(item => (0, object_1.getPropertyConversionFrom)(item));
            }
            else {
                const conversions = [];
                for (const key in source) {
                    const conversion = (0, object_1.getPropertyConversionFrom)(source[key]);
                    conversions.push(conversion);
                }
                return conversions;
            }
        }
        return [];
    }
    getItemSchema(source, resolver) {
        if (resolver != null) {
            const request = (0, object_1.getConversionRequestFrom)(source);
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
exports.ModifyArrayAction = ModifyArrayAction;
class CreateSpecifiedArrayAction extends ModifyArrayAction {
    transform(value, options, resolver) {
        const result = [];
        if (options != null) {
            this.initializeArray(result, options, value, resolver);
        }
        return result;
    }
    createSchema(options, resolver) {
        const schema = { type: 'array' };
        if (options != null) {
            this.initializeArraySchema(schema, options, resolver);
        }
        return schema;
    }
}
exports.CreateSpecifiedArrayAction = CreateSpecifiedArrayAction;
class CopyArrayAction {
    transform(value, options) {
        return value.slice();
    }
}
exports.CopyArrayAction = CopyArrayAction;
exports.DEFAULT_ARRAY_ACTIONS = {
    untyped: { ...actions_1.DEFAULT_UNTYPED_CONVERSIONS },
    conversion: {
        create: new CreateSpecifiedArrayAction()
    },
    typed: {
        clone: new CopyArrayAction(),
        delete: new object_1.DeleteNestedValueAction(),
        modify: new ModifyArrayAction(),
        set: new object_1.SetNestedValueAction()
    }
};
class ToArrayConvertor extends actions_1.TypedActionsValueConvertor {
    constructor(actions = exports.DEFAULT_ARRAY_ACTIONS) {
        super('object', getArrayFrom, actions);
    }
}
exports.ToArrayConvertor = ToArrayConvertor;
