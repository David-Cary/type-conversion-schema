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
    untyped: {
        default: new actions_1.DefaultValueAction(),
        parse: new ParseToBooleanAction(),
        setTo: new actions_1.ForceValueAction()
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
