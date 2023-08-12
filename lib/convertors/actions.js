"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypedActionsValueConvertor = exports.cloneTypedActionMap = exports.DEFAULT_UNTYPED_CONVERSIONS = exports.NestedConversionAction = exports.getConversionSchemaFromJSON = exports.GetValueAction = exports.DefaultValueAction = exports.ForceValueAction = void 0;
const literal_1 = require("./literal");
class ForceValueAction {
    transform(value, options) {
        return (0, literal_1.cloneJSON)(options?.value);
    }
}
exports.ForceValueAction = ForceValueAction;
class DefaultValueAction {
    transform(value, options) {
        return value === undefined ? (0, literal_1.cloneJSON)(options?.value) : value;
    }
}
exports.DefaultValueAction = DefaultValueAction;
class GetValueAction {
    transform(value, options) {
        if (typeof value === 'object' && options?.key != null) {
            if (Array.isArray(value)) {
                const index = Number(options.key);
                return value[index];
            }
            const key = String(options.key);
            return value[key];
        }
    }
}
exports.GetValueAction = GetValueAction;
function getConversionSchemaFromJSON(source) {
    return {
        type: String(source.type),
        actions: Array.isArray(source.actions)
            ? source.actions.filter(item => {
                switch (typeof item) {
                    case 'string': {
                        return true;
                    }
                    case 'object': {
                        return !Array.isArray(item) && typeof item?.type === 'string';
                    }
                }
                return false;
            })
            : []
    };
}
exports.getConversionSchemaFromJSON = getConversionSchemaFromJSON;
class NestedConversionAction {
    transform(value, options, resolver) {
        if (resolver != null && options != null) {
            switch (typeof options.to) {
                case 'string': {
                    return resolver.convert(value, options.to);
                }
                case 'object': {
                    if (options.to != null && !Array.isArray(options.to)) {
                        const schema = getConversionSchemaFromJSON(options.to);
                        return resolver.convert(value, schema);
                    }
                    break;
                }
            }
        }
        return value;
    }
}
exports.NestedConversionAction = NestedConversionAction;
exports.DEFAULT_UNTYPED_CONVERSIONS = {
    convert: new NestedConversionAction(),
    get: new GetValueAction(),
    setTo: new ForceValueAction()
};
function cloneTypedActionMap(source) {
    return {
        typed: { ...source.typed },
        untyped: { ...source.untyped }
    };
}
exports.cloneTypedActionMap = cloneTypedActionMap;
class TypedActionsValueConvertor {
    constructor(typeName, convert, actions) {
        this.typeName = typeName;
        this.convert = convert;
        this.actions = cloneTypedActionMap(actions);
    }
    getAction(key) {
        if (key in this.actions.typed) {
            return this.actions.typed[key];
        }
        return this.actions.untyped[key];
    }
    matches(value) {
        return typeof value === this.typeName;
    }
    convertWith(value, actions, resolver) {
        let untypedResult = value;
        const skippedRequests = [];
        for (const request of actions) {
            const expandedRequest = this.expandActionRequest(request);
            const action = this.actions.untyped[expandedRequest.type];
            if (action != null) {
                untypedResult = action.transform(untypedResult, expandedRequest, resolver);
            }
            else {
                skippedRequests.push(expandedRequest);
            }
        }
        let typedResult = this.convert(untypedResult);
        for (const request of skippedRequests) {
            const action = this.actions.typed[request.type];
            if (action != null) {
                typedResult = action.transform(typedResult, request, resolver);
            }
        }
        return typedResult;
    }
    expandActionRequest(source) {
        if (typeof source === 'object') {
            return source;
        }
        return {
            type: source
        };
    }
}
exports.TypedActionsValueConvertor = TypedActionsValueConvertor;
