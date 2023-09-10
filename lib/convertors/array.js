"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToArrayConvertor = exports.DEFAULT_ARRAY_ACTIONS = exports.DeleteArrayItemAction = exports.InsertArrayItemAction = exports.ParseArrayStringAction = exports.CopyArrayAction = exports.getArrayFrom = void 0;
const JSON_1 = require("../schema/JSON");
const actions_1 = require("./actions");
const object_1 = require("./object");
/**
 * Converts the provided value to an array.
 * This involves wrapping non-array values in an array with undefined values excluded.
 * @function
 * @param {unknown} source - value to be converted
 * @returns {any[]} source array or enclosing array for non-array sources
 */
function getArrayFrom(source) {
    if (Array.isArray(source)) {
        return source;
    }
    return source !== undefined ? [source] : [];
}
exports.getArrayFrom = getArrayFrom;
/**
 * Creates a shallow copy of the target array.
 * If passed 'from' and 'to' numbers in the options this will only copy a subset of the array.
 * @class
 * @implements {TypeConversionAction<any[]>}
 */
class CopyArrayAction {
    transform(value, options) {
        if (options != null) {
            const start = 'from' in options ? Number(options.from) : 0;
            if ('to' in options) {
                const toPosition = Number(options.to);
                if (toPosition !== -1) {
                    const end = toPosition + 1;
                    return value.slice(start, end);
                }
            }
            return value.slice(start);
        }
        return value.slice();
    }
}
exports.CopyArrayAction = CopyArrayAction;
/**
 * Retrieves an array from a potential JSON string.
 * @class
 * @implements {TypeConversionAction<any, any[]>}
 */
class ParseArrayStringAction {
    transform(value, options) {
        if (typeof value === 'string') {
            try {
                const parsed = JSON.parse(value);
                return getArrayFrom(parsed);
            }
            catch (error) {
                return [value];
            }
        }
        return getArrayFrom(value);
    }
}
exports.ParseArrayStringAction = ParseArrayStringAction;
/**
 * Adds a particular value to the target array.
 * If options include an index, that will be used as the target postion.  Otherwise the value will be added to the end.
 * If options include a repeat number that many copies of the value will be added.
 * If options do not include a value, the added value will be undefined.
 * @class
 * @implements {TypeConversionAction<any[]>}
 */
class InsertArrayItemAction {
    transform(value, options) {
        let index = value.length;
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
        value.splice.apply(value, params);
        return value;
    }
}
exports.InsertArrayItemAction = InsertArrayItemAction;
/**
 * Removes values from the target array.
 * If options include an index, that will be used as the target postion.  Otherwise the value will be removed from the end.
 * If options include a count that many items will be removed.
 * @class
 * @implements {TypeConversionAction<any[]>}
 */
class DeleteArrayItemAction {
    transform(value, options) {
        let index = -1;
        let count = 1;
        if (options != null) {
            if ('index' in options) {
                index = Number(options.index);
            }
            if ('count' in options) {
                count = Number(options.count);
            }
        }
        value.splice(index, count);
        return value;
    }
}
exports.DeleteArrayItemAction = DeleteArrayItemAction;
/**
 * Provides default actions for conversions to an array.
 * @const
 */
exports.DEFAULT_ARRAY_ACTIONS = {
    untyped: { ...actions_1.DEFAULT_UNTYPED_CONVERSIONS },
    conversion: {
        parse: new ParseArrayStringAction()
    },
    typed: {
        clone: new CopyArrayAction(),
        delete: new object_1.DeleteNestedValueAction(),
        deleteItem: new DeleteArrayItemAction(),
        insert: new InsertArrayItemAction(),
        set: new object_1.SetNestedValueAction()
    }
};
/**
 * Handles conversion of a given value to an array.
 * @class
 * @implements {TypedActionsValueConvertor<symbol>}
 */
class ToArrayConvertor extends actions_1.TypedActionsValueConvertor {
    constructor(actions = exports.DEFAULT_ARRAY_ACTIONS) {
        super('object', getArrayFrom, actions);
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
    finalizeValue(value, schema, resolver, context) {
        value = super.finalizeValue(value, schema, resolver, context);
        this.applySchemaTo(schema, value, resolver, context);
        return value;
    }
    /**
     * Helper function that enforces array schema restrictions on the target array.
     * @function
     * @param {Partial<TypeConversionSchema>} schema - schema to be used
     * @param {any[]} value - array to be modified
     * @param TypeConversionResolver | undefined} resolver - conversion resolver to be used on nested values
     * @param {TypeConversionContext | undefined} context - additional values to be used for resolving references
     */
    applySchemaTo(schema, target, resolver, context) {
        let prefixCount = 0;
        const fullSchema = Object.assign({ type: 'array' }, schema);
        let itemContext = resolver != null
            ? resolver.getChildContext(fullSchema, context)
            : context;
        if ('prefixItems' in schema && schema.prefixItems != null) {
            if (resolver != null) {
                for (let i = 0; i < schema.prefixItems.length; i++) {
                    target[i] = resolver.convert(target[i], schema.prefixItems[i], itemContext);
                }
            }
            prefixCount = schema.prefixItems.length;
        }
        if ('items' in schema && schema.items != null) {
            const uniqueItems = ('uniqueItems' in schema && schema.uniqueItems != null)
                ? schema.uniqueItems
                : false;
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
            if (resolver != null) {
                for (let i = target.length - 1; i >= prefixCount; i--) {
                    target[i] = resolver.convert(target[i], schema.items, itemContext);
                }
            }
            if (uniqueItems) {
                for (let i = target.length - 1; i >= prefixCount; i--) {
                    const value = target[i];
                    const matchIndex = target.indexOf(value);
                    if (matchIndex < i) {
                        target.splice(i, 1);
                    }
                }
            }
        }
        else {
            target.length = prefixCount;
        }
    }
}
exports.ToArrayConvertor = ToArrayConvertor;
