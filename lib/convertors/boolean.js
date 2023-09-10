"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToBooleanConvertor = exports.DEFAULT_BOOLEAN_ACTIONS = exports.NegateBooleanAction = exports.ParseToBooleanAction = void 0;
const actions_1 = require("./actions");
/**
 * Reads in certain predefined values as false.
 * By default, this is just the string 'false', but other values can be passed in through the option's 'false' property.
 * @class
 * @implements {TypeConversionAction<any[], boolean>}
 */
class ParseToBooleanAction {
    transform(value, options) {
        const falseValues = options?.false != null
            ? (Array.isArray(options.false) ? options.false : [options.false])
            : ['false'];
        if (falseValues.includes(value))
            return false;
        return Boolean(value);
    }
}
exports.ParseToBooleanAction = ParseToBooleanAction;
/**
 * Flips the value of provided boolean from true to false and vice versa.
 * @class
 * @implements {TypeConversionAction<boolean>}
 */
class NegateBooleanAction {
    transform(value) {
        return !value;
    }
}
exports.NegateBooleanAction = NegateBooleanAction;
/**
 * Provides default actions for conversions to a boolean.
 * @const
 */
exports.DEFAULT_BOOLEAN_ACTIONS = {
    untyped: { ...actions_1.DEFAULT_UNTYPED_CONVERSIONS },
    conversion: {
        parse: new ParseToBooleanAction()
    },
    typed: {
        negate: new NegateBooleanAction()
    }
};
/**
 * Handles conversion of a given value to a boolean.
 * @class
 * @implements {TypedActionsValueConvertor<boolean>}
 */
class ToBooleanConvertor extends actions_1.TypedActionsValueConvertor {
    constructor(actions = exports.DEFAULT_BOOLEAN_ACTIONS) {
        super('boolean', Boolean, actions);
    }
    prepareValue(value, schema, resolver) {
        if ('const' in schema && typeof schema.const === 'boolean') {
            return schema.const;
        }
        value = super.prepareValue(value, schema, resolver);
        if (value === undefined &&
            'default' in schema &&
            typeof schema.default === 'boolean') {
            return schema.default;
        }
        return value;
    }
}
exports.ToBooleanConvertor = ToBooleanConvertor;
