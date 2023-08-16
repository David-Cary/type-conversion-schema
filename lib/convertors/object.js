"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToObjectConvertor = exports.DEFAULT_OBJECT_ACTIONS = exports.SetObjectPropertyAction = exports.DeleteObjectValueAction = exports.AssignObjectDefaultsAction = exports.AssignObjectValuesAction = exports.CloneViaSpreadAction = exports.WrapInObjectAction = exports.getObjectFrom = void 0;
const actions_1 = require("./actions");
const JSType_1 = require("../schema/JSType");
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
    modifySchema(schema, options) {
        if (schema.type === 'object' && options != null) {
            if (schema.properties == null) {
                schema.properties = {};
            }
            for (const key in options) {
                const type = (0, JSType_1.getExtendedTypeOf)(options[key]);
                schema.properties[key] = (0, JSType_1.createBasicSchema)(type);
            }
        }
        return schema;
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
    modifySchema(schema, options) {
        if (schema.type === 'object' && options != null) {
            if (schema.properties == null) {
                schema.properties = {};
            }
            for (const key in options) {
                if (key in schema.properties)
                    continue;
                const type = (0, JSType_1.getExtendedTypeOf)(options[key]);
                schema.properties[key] = (0, JSType_1.createBasicSchema)(type);
            }
        }
        return schema;
    }
}
exports.AssignObjectDefaultsAction = AssignObjectDefaultsAction;
class DeleteObjectValueAction {
    transform(value, options) {
        if (typeof options?.key === 'string') {
            /* eslint-disable @typescript-eslint/no-dynamic-delete */
            delete value[options.key];
        }
        return value;
    }
    modifySchema(schema, options) {
        if (schema.type === 'object' && typeof options?.key === 'string') {
            if (schema.properties != null) {
                if (options.key in schema.properties) {
                    /* eslint-disable @typescript-eslint/no-dynamic-delete */
                    delete schema.properties[options.key];
                }
            }
        }
        return schema;
    }
}
exports.DeleteObjectValueAction = DeleteObjectValueAction;
class SetObjectPropertyAction {
    transform(value, options, resolver) {
        if (typeof options?.key === 'string') {
            let propertyValue = options.value;
            if (resolver != null) {
                const castAs = this.getConversionRequestFrom(options.as);
                if (castAs != null) {
                    propertyValue = resolver.convert(propertyValue, castAs);
                }
            }
            value[options.key] = propertyValue;
        }
        return value;
    }
    modifySchema(schema, options, resolver) {
        if (schema.type === 'object' && typeof options?.key === 'string') {
            if (schema.properties == null) {
                schema.properties = {};
            }
            const key = options.key;
            const castAs = this.getConversionRequestFrom(options.as);
            if (castAs != null) {
                if (resolver != null) {
                    const subschema = resolver.createJSTypeSchema(castAs);
                    schema.properties[key] = (subschema != null)
                        ? subschema
                        : (0, JSType_1.createBasicSchema)(JSType_1.JSTypeName.ANY);
                }
                else {
                    let castType = 'any';
                    if (typeof castAs === 'object') {
                        if ('type' in castAs) {
                            castType = castAs.type;
                        }
                    }
                    else {
                        castType = castAs;
                    }
                    const type = (castType in Object.values(JSType_1.JSTypeName))
                        ? castType
                        : JSType_1.JSTypeName.ANY;
                    schema.properties[key] = (0, JSType_1.createBasicSchema)(type);
                }
            }
            else {
                const type = (0, JSType_1.getExtendedTypeOf)(options.value);
                schema.properties[key] = (0, JSType_1.createBasicSchema)(type);
            }
        }
        return schema;
    }
    getConversionRequestFrom(source) {
        if (typeof source === 'string')
            return source;
        if (typeof source === 'object' &&
            source != null &&
            ('type' in source || 'anyOf' in source)) {
            return source;
        }
    }
}
exports.SetObjectPropertyAction = SetObjectPropertyAction;
exports.DEFAULT_OBJECT_ACTIONS = {
    untyped: { ...actions_1.DEFAULT_UNTYPED_CONVERSIONS },
    conversion: {
        wrap: new WrapInObjectAction()
    },
    typed: {
        assign: new AssignObjectValuesAction(),
        clone: new CloneViaSpreadAction(),
        defaults: new AssignObjectDefaultsAction(),
        delete: new DeleteObjectValueAction(),
        set: new SetObjectPropertyAction()
    }
};
class ToObjectConvertor extends actions_1.TypedActionsValueConvertor {
    constructor(actions = exports.DEFAULT_OBJECT_ACTIONS) {
        super('object', getObjectFrom, actions);
    }
}
exports.ToObjectConvertor = ToObjectConvertor;
