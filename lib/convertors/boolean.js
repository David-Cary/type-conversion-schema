"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToBooleanConvertor = exports.DEFAULT_BOOLEAN_ACTIONS = exports.NegateBooleanAction = void 0;
const actions_1 = require("./actions");
class NegateBooleanAction {
    transform(value, options) {
        return !value;
    }
}
exports.NegateBooleanAction = NegateBooleanAction;
exports.DEFAULT_BOOLEAN_ACTIONS = {
    untyped: {
        default: new actions_1.DefaultValueAction(),
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
