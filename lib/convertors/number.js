"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToNumberConvertor = exports.DEFAULT_NUMBER_ACTIONS = exports.NegativeNumberAction = exports.PositiveNumberAction = exports.MaximumNumberAction = exports.MinimumNumberAction = exports.NumberToMultipleOfAction = exports.getNumberWithDefault = exports.RoundDownNumberAction = exports.RoundUpNumberAction = exports.RoundNumberAction = exports.DefaultNumberAction = void 0;
const actions_1 = require("./actions");
class DefaultNumberAction {
    transform(value, options) {
        return isNaN(value) ? Number(options?.value) : value;
    }
}
exports.DefaultNumberAction = DefaultNumberAction;
class RoundNumberAction {
    transform(value, options) {
        return Math.round(value);
    }
    modifySchema(schema, options) {
        if (typeof schema === 'object') {
            schema.type = 'integer';
        }
    }
}
exports.RoundNumberAction = RoundNumberAction;
class RoundUpNumberAction extends RoundNumberAction {
    transform(value, options) {
        return Math.ceil(value);
    }
}
exports.RoundUpNumberAction = RoundUpNumberAction;
class RoundDownNumberAction extends RoundNumberAction {
    transform(value, options) {
        return Math.floor(value);
    }
}
exports.RoundDownNumberAction = RoundDownNumberAction;
function getNumberWithDefault(source, defaultValue = 0) {
    const converted = Number(source);
    return isNaN(converted) ? defaultValue : converted;
}
exports.getNumberWithDefault = getNumberWithDefault;
class NumberToMultipleOfAction {
    transform(value, options) {
        const offset = getNumberWithDefault(options?.offset, 0.5);
        const multiplier = getNumberWithDefault(options?.value, 1);
        return multiplier * Math.floor((value / multiplier) + offset);
    }
    modifySchema(schema, options) {
        if (typeof schema === 'object') {
            schema.multipleOf = getNumberWithDefault(options?.value, 1);
            schema.type = schema.multipleOf % 1 === 0 ? 'integer' : 'number';
        }
    }
}
exports.NumberToMultipleOfAction = NumberToMultipleOfAction;
class MinimumNumberAction {
    transform(value, options) {
        if (options != null) {
            const minimum = Number(options.value);
            if (!isNaN(minimum) && value < minimum) {
                return minimum;
            }
        }
        return value;
    }
    modifySchema(schema, options) {
        if (options != null && typeof schema === 'object') {
            const minimum = Number(options.value);
            if (!isNaN(minimum)) {
                schema.minimum = minimum;
                if (minimum % 1 !== 0)
                    schema.type = 'number';
            }
        }
    }
}
exports.MinimumNumberAction = MinimumNumberAction;
class MaximumNumberAction {
    transform(value, options) {
        if (options != null) {
            const maximum = Number(options.value);
            if (!isNaN(maximum) && value > maximum) {
                return maximum;
            }
        }
        return value;
    }
    modifySchema(schema, options) {
        if (options != null && typeof schema === 'object') {
            const maximum = Number(options.value);
            if (!isNaN(maximum)) {
                schema.maximum = maximum;
                if (maximum % 1 !== 0)
                    schema.type = 'number';
            }
        }
    }
}
exports.MaximumNumberAction = MaximumNumberAction;
class PositiveNumberAction {
    transform(value, options) {
        return value < 0 ? -value : value;
    }
    modifySchema(schema, options) {
        if (typeof schema === 'object') {
            if (schema.minimum === undefined || schema.minimum < 0) {
                schema.minimum = 0;
            }
        }
    }
}
exports.PositiveNumberAction = PositiveNumberAction;
class NegativeNumberAction {
    transform(value, options) {
        return value > 0 ? -value : value;
    }
    modifySchema(schema, options) {
        if (typeof schema === 'object') {
            if (schema.maximum === undefined || schema.maximum > 0) {
                schema.maximum = 0;
            }
        }
    }
}
exports.NegativeNumberAction = NegativeNumberAction;
exports.DEFAULT_NUMBER_ACTIONS = {
    untyped: {
        setTo: new actions_1.ForceValueAction()
    },
    typed: {
        default: new DefaultNumberAction(),
        max: new MaximumNumberAction(),
        min: new MinimumNumberAction(),
        multiple: new NumberToMultipleOfAction(),
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
}
exports.ToNumberConvertor = ToNumberConvertor;
