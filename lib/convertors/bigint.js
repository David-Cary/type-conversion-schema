"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToBigIntConvertor = exports.DEFAULT_BIG_INT_ACTIONS = exports.NegativeBigIntAction = exports.PositiveBigIntAction = exports.MaximumBigIntAction = exports.MinimumBigIntAction = exports.BigIntToMultipleOfAction = exports.getBigIntFrom = void 0;
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
class BigIntToMultipleOfAction {
    transform(value, options) {
        const multiplier = getBigIntFrom(options?.value, 1n);
        const offset = multiplier / 2n;
        const multiples = (value + offset) / multiplier;
        return multiplier * multiples;
    }
    modifySchema(schema, options) {
        if (schema.type === 'bigint') {
            schema.multipleOf = getBigIntFrom(options?.value, 1n);
        }
        return schema;
    }
}
exports.BigIntToMultipleOfAction = BigIntToMultipleOfAction;
class MinimumBigIntAction {
    transform(value, options) {
        if (options != null) {
            const minimum = getBigIntFrom(options.value);
            if (value < minimum) {
                return minimum;
            }
        }
        return value;
    }
    modifySchema(schema, options) {
        if (schema.type === 'bigint' && options != null) {
            schema.minimum = getBigIntFrom(options.value);
        }
        return schema;
    }
}
exports.MinimumBigIntAction = MinimumBigIntAction;
class MaximumBigIntAction {
    transform(value, options) {
        if (options != null) {
            const maximum = getBigIntFrom(options.value);
            if (value > maximum) {
                return maximum;
            }
        }
        return value;
    }
    modifySchema(schema, options) {
        if (schema.type === 'bigint' && options != null) {
            schema.maximum = getBigIntFrom(options.value);
        }
        return schema;
    }
}
exports.MaximumBigIntAction = MaximumBigIntAction;
class PositiveBigIntAction {
    transform(value) {
        return value < 0 ? -value : value;
    }
    modifySchema(schema, options) {
        if (schema.type === 'bigint') {
            if (schema.minimum === undefined || schema.minimum < 0) {
                schema.minimum = 0n;
            }
        }
        return schema;
    }
}
exports.PositiveBigIntAction = PositiveBigIntAction;
class NegativeBigIntAction {
    transform(value) {
        return value > 0 ? -value : value;
    }
    modifySchema(schema, options) {
        if (schema.type === 'bigint') {
            if (schema.maximum === undefined || schema.maximum > 0) {
                schema.maximum = 0n;
            }
        }
        return schema;
    }
}
exports.NegativeBigIntAction = NegativeBigIntAction;
exports.DEFAULT_BIG_INT_ACTIONS = {
    untyped: { ...actions_1.DEFAULT_UNTYPED_CONVERSIONS },
    conversion: {},
    typed: {
        max: new MaximumBigIntAction(),
        min: new MinimumBigIntAction(),
        multiple: new BigIntToMultipleOfAction(),
        negative: new NegativeBigIntAction(),
        positive: new PositiveBigIntAction()
    }
};
class ToBigIntConvertor extends actions_1.TypedActionsValueConvertor {
    constructor(actions = exports.DEFAULT_BIG_INT_ACTIONS) {
        super('bigint', getBigIntFrom, actions);
    }
    initializeJSTypeSchema(source) {
        const schema = super.initializeJSTypeSchema(source);
        if (schema.type === 'bigint') {
            schema.integer = true;
        }
        return schema;
    }
}
exports.ToBigIntConvertor = ToBigIntConvertor;
