"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToBooleanConvertor = exports.DEFAULT_BOOLEAN_ACTIONS = exports.NegateBooleanAction = exports.ParseToBooleanAction = void 0;
const actions_1 = require("./actions");
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
class NegateBooleanAction {
    transform(value) {
        return !value;
    }
}
exports.NegateBooleanAction = NegateBooleanAction;
exports.DEFAULT_BOOLEAN_ACTIONS = {
    untyped: { ...actions_1.DEFAULT_UNTYPED_CONVERSIONS },
    conversion: {
        parse: new ParseToBooleanAction()
    },
    typed: {
        negate: new NegateBooleanAction()
    }
};
class ToBooleanConvertor extends actions_1.TypedActionsValueConvertor {
    constructor(actions = exports.DEFAULT_BOOLEAN_ACTIONS) {
        super('boolean', Boolean, actions);
    }
}
exports.ToBooleanConvertor = ToBooleanConvertor;
