"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToNumberConvertor = exports.DEFAULT_NUMBER_ACTIONS = exports.NegativeNumberAction = exports.PositiveNumberAction = exports.RoundDownNumberAction = exports.RoundUpNumberAction = exports.RoundNumberAction = void 0;
const actions_1 = require("./actions");
class RoundNumberAction {
    transform(value) {
        return Math.round(value);
    }
    expandSchema(schema, options) {
        if (schema.type === 'number') {
            schema.integer = true;
        }
    }
}
exports.RoundNumberAction = RoundNumberAction;
class RoundUpNumberAction extends RoundNumberAction {
    transform(value) {
        return Math.ceil(value);
    }
}
exports.RoundUpNumberAction = RoundUpNumberAction;
class RoundDownNumberAction extends RoundNumberAction {
    transform(value) {
        return Math.floor(value);
    }
}
exports.RoundDownNumberAction = RoundDownNumberAction;
class PositiveNumberAction {
    transform(value) {
        return value < 0 ? -value : value;
    }
    expandSchema(schema, options) {
        if (schema.type === 'number') {
            if (schema.minimum === undefined || schema.minimum < 0) {
                schema.minimum = 0;
            }
        }
    }
}
exports.PositiveNumberAction = PositiveNumberAction;
class NegativeNumberAction {
    transform(value) {
        return value > 0 ? -value : value;
    }
    expandSchema(schema, options) {
        if (schema.type === 'number') {
            if (schema.maximum === undefined || schema.maximum > 0) {
                schema.maximum = 0;
            }
        }
    }
}
exports.NegativeNumberAction = NegativeNumberAction;
exports.DEFAULT_NUMBER_ACTIONS = {
    untyped: { ...actions_1.DEFAULT_UNTYPED_CONVERSIONS },
    conversion: {},
    typed: {
        negative: new NegativeNumberAction(),
        positive: new PositiveNumberAction(),
        round: new RoundNumberAction(),
        roundDown: new RoundDownNumberAction(),
        roundUp: new RoundUpNumberAction()
    }
};
class ToNumberConvertor extends actions_1.TypedActionsValueConvertor {
    constructor(actions = exports.DEFAULT_NUMBER_ACTIONS) {
        super('number', Number, actions);
    }
    prepareValue(value, schema, resolver) {
        if ('const' in schema && typeof schema.const === 'number') {
            return schema.const;
        }
        value = super.prepareValue(value, schema, resolver);
        return value;
    }
    finalizeValue(value, schema, resolver) {
        if (isNaN(value) &&
            'default' in schema &&
            typeof schema.default === 'number') {
            value = schema.default;
        }
        value = this.enforceRange(value, schema);
        if ('multipleOf' in schema && typeof schema.multipleOf === 'number') {
            value = schema.multipleOf * Math.round(value / schema.multipleOf);
        }
        value = super.finalizeValue(value, schema, resolver);
        return value;
    }
    enforceRange(value, schema) {
        if ('minimum' in schema && typeof schema.minimum === 'number') {
            if (value < schema.minimum) {
                value = schema.minimum;
            }
        }
        else if ('exclusiveMinimum' in schema && typeof schema.exclusiveMinimum === 'number') {
            if (value <= schema.exclusiveMinimum) {
                const offset = schema.integer === true ? 1 : 0.1;
                value = schema.exclusiveMinimum + offset;
            }
        }
        if ('maximum' in schema && typeof schema.maximum === 'number') {
            if (value < schema.maximum) {
                value = schema.maximum;
            }
        }
        else if ('exclusiveMaximum' in schema && typeof schema.exclusiveMaximum === 'number') {
            if (value <= schema.exclusiveMaximum) {
                const offset = schema.integer === true ? -1 : -0.1;
                value = schema.exclusiveMaximum + offset;
            }
        }
        return value;
    }
    finalizeSchema(schema, resolver) {
        if ('multipleOf' in schema && typeof schema.multipleOf === 'number') {
            schema.integer = schema.multipleOf % 1 === 0;
        }
        super.finalizeSchema(schema, resolver);
    }
}
exports.ToNumberConvertor = ToNumberConvertor;
