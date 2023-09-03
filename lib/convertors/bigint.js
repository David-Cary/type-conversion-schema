"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToBigIntConvertor = exports.DEFAULT_BIG_INT_ACTIONS = exports.NegativeBigIntAction = exports.PositiveBigIntAction = exports.getBigIntFrom = void 0;
const actions_1 = require("./actions");
function getBigIntFrom(value, defaultValue = 0n) {
    switch (typeof value) {
        case 'number':
        case 'string':
        case 'boolean': {
            return BigInt(value);
        }
        case 'bigint': {
            return value;
        }
    }
    return defaultValue;
}
exports.getBigIntFrom = getBigIntFrom;
class PositiveBigIntAction {
    transform(value) {
        return value < 0 ? -value : value;
    }
    expandSchema(schema, options) {
        if (schema.type === 'bigint') {
            if (schema.minimum === undefined || schema.minimum < 0) {
                schema.minimum = 0n;
            }
        }
    }
}
exports.PositiveBigIntAction = PositiveBigIntAction;
class NegativeBigIntAction {
    transform(value) {
        return value > 0 ? -value : value;
    }
    expandSchema(schema, options) {
        if (schema.type === 'bigint') {
            if (schema.maximum === undefined || schema.maximum > 0) {
                schema.maximum = 0n;
            }
        }
    }
}
exports.NegativeBigIntAction = NegativeBigIntAction;
exports.DEFAULT_BIG_INT_ACTIONS = {
    untyped: { ...actions_1.DEFAULT_UNTYPED_CONVERSIONS },
    conversion: {},
    typed: {
        negative: new NegativeBigIntAction(),
        positive: new PositiveBigIntAction()
    }
};
class ToBigIntConvertor extends actions_1.TypedActionsValueConvertor {
    constructor(actions = exports.DEFAULT_BIG_INT_ACTIONS) {
        super('bigint', getBigIntFrom, actions);
    }
    prepareValue(value, schema, resolver) {
        if ('const' in schema && typeof schema.const === 'bigint') {
            return schema.const;
        }
        value = super.prepareValue(value, schema, resolver);
        if (value == null &&
            'default' in schema &&
            typeof schema.default === 'bigint') {
            value = schema.default;
        }
        return value;
    }
    finalizeValue(value, schema, resolver) {
        value = this.enforceRange(value, schema);
        if ('multipleOf' in schema && typeof schema.multipleOf === 'bigint') {
            const halfStep = schema.multipleOf / 2n;
            value = schema.multipleOf * ((value + halfStep) / schema.multipleOf);
        }
        value = super.finalizeValue(value, schema, resolver);
        return value;
    }
    enforceRange(value, schema) {
        if ('minimum' in schema && typeof schema.minimum === 'bigint') {
            if (value < schema.minimum) {
                value = schema.minimum;
            }
        }
        else if ('exclusiveMinimum' in schema && typeof schema.exclusiveMinimum === 'bigint') {
            if (value <= schema.exclusiveMinimum) {
                value = schema.exclusiveMinimum + 1n;
            }
        }
        if ('maximum' in schema && typeof schema.maximum === 'bigint') {
            if (value > schema.maximum) {
                value = schema.maximum;
            }
        }
        else if ('exclusiveMaximum' in schema && typeof schema.exclusiveMaximum === 'bigint') {
            if (value >= schema.exclusiveMaximum) {
                value = schema.exclusiveMaximum - 1n;
            }
        }
        return value;
    }
    finalizeSchema(schema, resolver) {
        if (schema.type === 'bigint') {
            schema.integer = true;
        }
        super.finalizeSchema(schema, resolver);
    }
}
exports.ToBigIntConvertor = ToBigIntConvertor;
