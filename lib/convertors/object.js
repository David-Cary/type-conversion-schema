"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToObjectConvertor = exports.DEFAULT_OBJECT_ACTIONS = exports.DeleteNestedValueAction = exports.SetNestedValueAction = exports.PickPropertiesAction = exports.OmitPropertiesAction = exports.CreateWrapperObjectAction = exports.getObjectFrom = void 0;
const actions_1 = require("./actions");
const JSON_1 = require("../schema/JSON");
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
class CreateWrapperObjectAction {
    transform(value, options) {
        const key = options?.key != null ? String(options.key) : 'value';
        return { [key]: value };
    }
}
exports.CreateWrapperObjectAction = CreateWrapperObjectAction;
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
class DeleteNestedValueAction {
    transform(value, options) {
        if (options?.path != null) {
            this.deleteNestedValue(value, options.path);
        }
        return value;
    }
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
class ToObjectConvertor extends actions_1.TypedActionsValueConvertor {
    constructor(actions = exports.DEFAULT_OBJECT_ACTIONS, cloneVia = JSON_1.cloneJSON) {
        super('object', getObjectFrom, actions);
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
