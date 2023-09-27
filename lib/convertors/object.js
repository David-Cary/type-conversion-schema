"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToObjectConvertor = exports.DEFAULT_OBJECT_ACTIONS = exports.DeleteNestedValueAction = exports.SetNestedValueAction = exports.PickPropertiesAction = exports.OmitPropertiesAction = exports.CreateWrapperObjectAction = void 0;
const conversions_1 = require("../schema/conversions");
const actions_1 = require("./actions");
const JSON_1 = require("../schema/JSON");
/**
 * Wraps the provided value in an object.
 * The key for the wrapped value is taken from the 'key' option, defaulting to 'value'.
 * @class
 * @implements {TypeConversionAction<any, POJObject>}
 */
class CreateWrapperObjectAction {
    transform(value, options) {
        if (options?.asNeeded === true &&
            typeof value === 'object' &&
            value != null &&
            !Array.isArray(value)) {
            return value;
        }
        const key = options?.key != null ? String(options.key) : 'value';
        return { [key]: value };
    }
}
exports.CreateWrapperObjectAction = CreateWrapperObjectAction;
/**
 * Gets a copy of the provided object that excludes all values whose key is in the option's 'properties' array.
 * @class
 * @implements {TypeConversionAction<POJObject>}
 */
class OmitPropertiesAction {
    transform(value, options) {
        if (options != null && Array.isArray(options.properties)) {
            const results = {};
            for (const key in value) {
                if (!options.properties.includes(key)) {
                    results[key] = value[key];
                }
            }
            return results;
        }
        return { ...value };
    }
}
exports.OmitPropertiesAction = OmitPropertiesAction;
/**
 * Gets a copy of the provided object that only includes values whose key is in the option's 'properties' array.
 * @class
 * @implements {TypeConversionAction<POJObject>}
 */
class PickPropertiesAction {
    transform(value, options) {
        if (options != null && Array.isArray(options.properties)) {
            const results = {};
            for (const key in value) {
                if (options.properties.includes(key)) {
                    results[key] = value[key];
                }
            }
            return results;
        }
        return {};
    }
}
exports.PickPropertiesAction = PickPropertiesAction;
/**
 * Modifies a nested value within the provided object / array.
 * The path to the target value is taken from the option of the same name.
 * The value to be assigned can be set directly through the 'value' option.
 * If the 'from' option is set, the set value will be results of a getNestedValue call using the 'from' option as the path.
 * If the 'default' option is set, that will be used if the retrieved value is undefined.
 * @template T
 * @class
 * @implements {TypeConversionAction<T>}
 */
class SetNestedValueAction {
    transform(value, options) {
        if (options?.path != null) {
            let propertyValue = (options.from != null)
                ? (0, actions_1.getNestedValue)(value, options.from)
                : options.value;
            if (propertyValue === undefined && options.default !== undefined) {
                propertyValue = options.default;
            }
            this.setNestedValue(value, options.path, propertyValue);
        }
        return value;
    }
    /**
     * Helper function that performs the actual value assignment for this action.
     * @function
     * @param {any} collection - top level value to be modified
     * @param {any} path - key or array of keys indicating the property to be set
     * @param {unknown} value - value to be used at the target location
     */
    setNestedValue(collection, path, value) {
        let target = collection;
        const steps = Array.isArray(path) ? path : [path];
        const finalIndex = steps.length - 1;
        if (finalIndex >= 0) {
            for (let i = 0; i < finalIndex; i++) {
                const step = steps[i];
                if (typeof target === 'object' && target != null) {
                    if (Array.isArray(target)) {
                        const index = Number(step);
                        if (isNaN(index))
                            return;
                        const nextTarget = target[index] ?? this.createCollectionFor(steps[i + 1]);
                        if (nextTarget != null) {
                            target[index] = nextTarget;
                            target = nextTarget;
                        }
                        else
                            return;
                    }
                    else {
                        const key = String(step);
                        const nextTarget = target[key] ?? this.createCollectionFor(steps[i + 1]);
                        if (nextTarget != null) {
                            target[key] = nextTarget;
                            target = nextTarget;
                        }
                        else
                            return;
                    }
                }
                else
                    return;
            }
            if (typeof target === 'object' && target != null) {
                const step = steps[finalIndex];
                if (Array.isArray(target)) {
                    const index = Number(step);
                    if (isNaN(index))
                        return;
                    target[index] = value;
                }
                else {
                    const key = String(step);
                    target[key] = value;
                }
            }
        }
    }
    /**
     * Helper function that creates a wrapper object or array, depending on the type of key provided.
     * @function
     * @param {any} key - key to be used
     * @Returns {POJObject | any[] | undefined} an empty object for string keys, an empty array for number keys, or undefined for an invalid key
     */
    createCollectionFor(key) {
        switch (typeof key) {
            case 'string': {
                return {};
            }
            case 'number': {
                return [];
            }
        }
    }
}
exports.SetNestedValueAction = SetNestedValueAction;
/**
 * Removes a nested value within the provided object / array.
 * The path to the target value is taken from the option of the same name.
 * @template T
 * @class
 * @implements {TypeConversionAction<T>}
 */
class DeleteNestedValueAction {
    transform(value, options) {
        if (options?.path != null) {
            this.deleteNestedValue(value, options.path);
        }
        return value;
    }
    /**
     * Helper function that performs the actual removal of the target value.
     * @function
     * @param {any} collection - object / array containing the target value
     * @param {any} path - key or key array to the target value.
     */
    deleteNestedValue(collection, path) {
        const steps = Array.isArray(path) ? path : [path];
        const finalIndex = steps.length - 1;
        if (finalIndex >= 0) {
            const targetPath = steps.slice(0, finalIndex);
            const target = (0, actions_1.getNestedValue)(collection, targetPath);
            if (typeof target === 'object' && target != null) {
                const step = steps[finalIndex];
                if (Array.isArray(target)) {
                    const index = Number(step);
                    if (isNaN(index))
                        return;
                    target.splice(index, 1);
                }
                else {
                    const key = String(step);
                    if (key in target) {
                        /* eslint-disable @typescript-eslint/no-dynamic-delete */
                        delete target[key];
                    }
                }
            }
        }
    }
}
exports.DeleteNestedValueAction = DeleteNestedValueAction;
/**
 * Provides default actions for conversions to an object.
 * @const
 */
exports.DEFAULT_OBJECT_ACTIONS = {
    untyped: { ...actions_1.DEFAULT_UNTYPED_CONVERSIONS },
    conversion: {
        wrap: new CreateWrapperObjectAction()
    },
    typed: {
        delete: new DeleteNestedValueAction(),
        omit: new OmitPropertiesAction(),
        pick: new PickPropertiesAction(),
        set: new SetNestedValueAction()
    }
};
/**
 * Handles conversion of a given value to an object.
 * @class
 * @implements {TypedActionsValueConvertor<POJObject>}
 */
class ToObjectConvertor extends actions_1.TypedActionsValueConvertor {
    constructor(actions = exports.DEFAULT_OBJECT_ACTIONS, cloneVia = JSON_1.cloneJSON) {
        super('object', conversions_1.getObjectFrom, actions);
        this.clone = cloneVia;
    }
    prepareValue(value, schema, resolver) {
        if ('const' in schema && typeof schema.const === 'object') {
            return this.clone(schema.const);
        }
        value = super.prepareValue(value, schema, resolver);
        if (value == null &&
            'default' in schema &&
            typeof schema.default === 'object') {
            value = this.clone(schema.default);
        }
        return value;
    }
    finalizeValue(value, schema, resolver, context) {
        value = super.finalizeValue(value, schema, resolver, context);
        this.applySchemaTo(schema, value, resolver, context);
        return value;
    }
    /**
     * Helper function that enforces object schema restrictions on the target object.
     * @function
     * @param {Partial<TypeConversionSchema>} schema - schema to be used
     * @param {POJObject} value - object to be modified
     * @param TypeConversionResolver | undefined} resolver - conversion resolver to be used on nested values
     * @param {TypeConversionContext | undefined} context - additional values to be used for resolving references
     */
    applySchemaTo(schema, target, resolver, context) {
        const properties = ('properties' in schema && schema.properties != null)
            ? schema.properties
            : {};
        let childContext = context;
        if (resolver != null) {
            const fullSchema = Object.assign({ type: 'object' }, schema);
            childContext = resolver.getChildContext(fullSchema, context);
            for (const key in properties) {
                target[key] = resolver.convert(target[key], properties[key], childContext);
            }
        }
        const additionalProperties = ('additionalProperties' in schema)
            ? schema.additionalProperties
            : undefined;
        const patternProperties = ('patternProperties' in schema && schema.patternProperties != null)
            ? schema.patternProperties
            : {};
        for (const key in target) {
            if (key in properties)
                continue;
            if (additionalProperties == null) {
                /* eslint-disable @typescript-eslint/no-dynamic-delete */
                delete target[key];
            }
            else if (resolver != null) {
                let patternMatched = false;
                for (const pattern in patternProperties) {
                    const exp = new RegExp(pattern);
                    patternMatched = exp.test(key);
                    if (patternMatched) {
                        target[key] = resolver.convert(target[key], patternProperties[pattern], childContext);
                        break;
                    }
                }
                if (patternMatched)
                    continue;
                target[key] = resolver.convert(target[key], additionalProperties, childContext);
            }
        }
    }
}
exports.ToObjectConvertor = ToObjectConvertor;
