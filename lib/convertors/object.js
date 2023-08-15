"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToObjectConvertor = exports.DEFAULT_OBJECT_ACTIONS = exports.DeleteObjectValuesAction = exports.AssignObjectDefaultsAction = exports.AssignObjectValuesAction = exports.CloneViaSpreadAction = exports.WrapInObjectAction = exports.getObjectFrom = void 0;
const actions_1 = require("./actions");
function getObjectFrom(source) {
    switch (typeof source) {
        case 'object': {
            if (Array.isArray(source)) {
                const map = {};
                for (let i = 0; i < source.length; i++) {
                    map[String(i)] = source[i];
                }
                return map;
            }
            if (source != null)
                return source;
            break;
        }
        case 'string': {
            try {
                return JSON.parse(source);
            }
            catch (error) {
                return {};
            }
        }
    }
    return {};
}
exports.getObjectFrom = getObjectFrom;
class WrapInObjectAction {
    transform(value, options) {
        if (typeof options?.key === 'string' && options.key.length > 0) {
            const wrapper = {};
            wrapper[options.key] = value;
            return wrapper;
        }
        return getObjectFrom(value);
    }
    createSchema() {
        return { type: 'object' };
    }
    modifySchema(schema, options) {
        const properties = {};
        if (typeof options?.key === 'string' && options.key.length > 0) {
            properties[options.key] = schema;
        }
        return {
            type: 'object',
            properties
        };
    }
}
exports.WrapInObjectAction = WrapInObjectAction;
class CloneViaSpreadAction {
    transform(value, options) {
        return { ...value };
    }
}
exports.CloneViaSpreadAction = CloneViaSpreadAction;
class AssignObjectValuesAction {
    transform(value, options) {
        if (typeof options?.values === 'object' && options.values != null) {
            Object.assign(value, options.value);
        }
        return value;
    }
}
exports.AssignObjectValuesAction = AssignObjectValuesAction;
class AssignObjectDefaultsAction {
    transform(value, options) {
        if (typeof options?.values === 'object' && options.values != null) {
            const map = options.values;
            for (const key in map) {
                if (value[key] === undefined) {
                    value[key] = map[key];
                }
            }
        }
        return value;
    }
}
exports.AssignObjectDefaultsAction = AssignObjectDefaultsAction;
class DeleteObjectValuesAction {
    transform(value, options) {
        const keys = options != null && Array.isArray(options.keys)
            ? options.keys
            : [];
        for (const key of keys) {
            const stringKey = String(key);
            if (stringKey in value) {
                /* eslint-disable @typescript-eslint/no-dynamic-delete */
                delete value[stringKey];
            }
        }
        return value;
    }
}
exports.DeleteObjectValuesAction = DeleteObjectValuesAction;
exports.DEFAULT_OBJECT_ACTIONS = {
    untyped: { ...actions_1.DEFAULT_UNTYPED_CONVERSIONS },
    conversion: {
        wrap: new WrapInObjectAction()
    },
    typed: {
        assign: new AssignObjectValuesAction(),
        clone: new CloneViaSpreadAction(),
        defaults: new AssignObjectDefaultsAction(),
        delete: new DeleteObjectValuesAction()
    }
};
class ToObjectConvertor extends actions_1.TypedActionsValueConvertor {
    constructor(actions = exports.DEFAULT_OBJECT_ACTIONS) {
        super('object', getObjectFrom, actions);
    }
}
exports.ToObjectConvertor = ToObjectConvertor;
