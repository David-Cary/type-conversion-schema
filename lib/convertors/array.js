"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToArrayConvertor = exports.DEFAULT_ARRAY_ACTIONS = exports.ModifyArrayAction = exports.SetArrayItemAction = exports.RemoveArrayItemAction = exports.InsertArrayItemAction = exports.CopyArrayAction = exports.getArrayFrom = void 0;
const JSON_1 = require("../schema/JSON");
const actions_1 = require("./actions");
const JSType_1 = require("../schema/JSType");
function getArrayFrom(source) {
    if (Array.isArray(source)) {
        return source;
    }
    return source !== undefined ? [source] : [];
}
exports.getArrayFrom = getArrayFrom;
class CopyArrayAction {
    transform(value, options) {
        if (options != null) {
            const start = 'from' in options ? Number(options.from) : 0;
            if ('to' in options) {
                const end = Number(options.to);
                return value.slice(start, end);
            }
            return value.slice(start);
        }
        return value.slice();
    }
}
exports.CopyArrayAction = CopyArrayAction;
class InsertArrayItemAction {
    transform(value, options) {
        let index = 0;
        let repeat = 1;
        let itemValue;
        if (options != null) {
            if ('index' in options) {
                index = Number(options.index);
            }
            if ('repeat' in options) {
                repeat = Number(options.repeat);
            }
            if ('value' in options) {
                itemValue = options.value;
            }
        }
        const params = [index, 0];
        for (let i = 0; i < repeat; i++) {
            const instance = (0, JSON_1.cloneJSON)(itemValue);
            params.push(instance);
        }
        return value.splice.apply(null, params);
    }
}
exports.InsertArrayItemAction = InsertArrayItemAction;
class RemoveArrayItemAction {
    transform(value, options) {
        let index = 0;
        let count = 1;
        if (options != null) {
            if ('index' in options) {
                index = Number(options.index);
            }
            if ('count' in options) {
                count = Number(options.count);
            }
        }
        return value.splice(index, count);
    }
}
exports.RemoveArrayItemAction = RemoveArrayItemAction;
class SetArrayItemAction {
    transform(value, options, resolver) {
        let index = 0;
        let itemValue;
        if (options != null) {
            if ('index' in options) {
                index = Number(options.index);
                if (index < 0) {
                    index = Math.max(0, value.length + index);
                }
                itemValue = value[index];
            }
            if (resolver != null && 'to' in options) {
                const schema = (0, actions_1.getConversionSchemaFrom)(options.to);
                if (schema != null) {
                    itemValue = resolver.convert(itemValue, schema);
                }
            }
        }
        value[index] = itemValue;
        return value;
    }
}
exports.SetArrayItemAction = SetArrayItemAction;
class ModifyArrayAction {
    transform(value, options, resolver) {
        if (options != null) {
            const schema = this.getArraySchemaFrom(options);
            this.applySchemaTo(schema, value, resolver);
        }
        return value;
    }
    getArraySchemaFrom(source) {
        const schema = { type: JSType_1.JSTypeName.ARRAY };
        if (typeof source.prefixItems === 'object' &&
            source.prefixItems != null &&
            Array.isArray(source.prefixItems)) {
            schema.prefixItems = this.getSchemaList(source.prefixItems);
        }
        schema.items = this.getSchemaFrom(source.items);
        if ('minItems' in source) {
            schema.minItems = Number(source.minItems);
        }
        if ('maxItems' in source) {
            schema.maxItems = Number(source.maxItems);
        }
        if ('uniqueItems' in source) {
            schema.uniqueItems = Boolean(source.uniqueItems);
        }
        return schema;
    }
    getSchemaList(source) {
        const schemas = [];
        for (let i = 0; i < source.length; i++) {
            const schema = this.getSchemaFrom(source[i]);
            if (schema != null) {
                schemas.push(schema);
            }
        }
        return schemas;
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
        if ('minItems' in schema && schema.minItems != null) {
            if (target.length < schema.minItems) {
                target.length = schema.minItems;
            }
        }
        if ('maxItems' in schema && schema.maxItems != null) {
            if (target.length > schema.maxItems) {
                target.length = schema.maxItems;
            }
        }
        let prefixCount = 0;
        if ('prefixItems' in schema && schema.prefixItems != null) {
            if (resolver != null) {
                for (let i = 0; i < schema.prefixItems.length; i++) {
                    target[i] = resolver.convert(target[i], schema.prefixItems[i]);
                }
            }
            prefixCount = schema.prefixItems.length;
        }
        if ('items' in schema && schema.items != null) {
            const uniqueItems = ('uniqueItems' in schema && schema.uniqueItems != null)
                ? schema.uniqueItems
                : false;
            for (let i = target.length - 1; i >= prefixCount; i--) {
                const value = resolver != null
                    ? resolver.convert(target[i], schema.items)
                    : target[i];
                if (uniqueItems && target.includes(value)) {
                    target.splice(i, 1);
                }
                else {
                    target[i] = value;
                }
            }
        }
        else {
            target.length = prefixCount;
        }
    }
}
exports.ModifyArrayAction = ModifyArrayAction;
exports.DEFAULT_ARRAY_ACTIONS = {
    untyped: { ...actions_1.DEFAULT_UNTYPED_CONVERSIONS },
    conversion: {},
    typed: {
        clone: new CopyArrayAction(),
        insert: new InsertArrayItemAction(),
        modify: new ModifyArrayAction(),
        remove: new RemoveArrayItemAction(),
        set: new SetArrayItemAction()
    }
};
class ToArrayConvertor extends actions_1.TypedActionsValueConvertor {
    constructor(actions = exports.DEFAULT_ARRAY_ACTIONS) {
        super('object', getArrayFrom, actions);
        this.mutator = new ModifyArrayAction();
    }
    prepareValue(value, schema, resolver) {
        if ('const' in schema && Array.isArray(schema.const)) {
            return schema.const.slice();
        }
        value = super.prepareValue(value, schema, resolver);
        if (value == null &&
            'default' in schema &&
            Array.isArray(schema.const)) {
            value = schema.default.slice;
        }
        return value;
    }
    finalizeValue(value, schema, resolver) {
        value = super.finalizeValue(value, schema, resolver);
        this.mutator.applySchemaTo(schema, value, resolver);
        return value;
    }
}
exports.ToArrayConvertor = ToArrayConvertor;
