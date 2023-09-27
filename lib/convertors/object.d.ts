import { type TypeConversionAction, type TypeConversionResolver, type TypeConversionSchema, type TypeConversionContext, type POJObject } from '../schema/conversions';
import { type JSONObject } from '../schema/JSON';
import { TypedActionsValueConvertor, type TypedActionMap } from './actions';
/**
 * Wraps the provided value in an object.
 * The key for the wrapped value is taken from the 'key' option, defaulting to 'value'.
 * @class
 * @implements {TypeConversionAction<any, POJObject>}
 */
export declare class CreateWrapperObjectAction implements TypeConversionAction<any, POJObject> {
    transform(value: any, options?: JSONObject): POJObject;
}
/**
 * Gets a copy of the provided object that excludes all values whose key is in the option's 'properties' array.
 * @class
 * @implements {TypeConversionAction<POJObject>}
 */
export declare class OmitPropertiesAction implements TypeConversionAction<POJObject> {
    transform(value: POJObject, options?: JSONObject): POJObject;
}
/**
 * Gets a copy of the provided object that only includes values whose key is in the option's 'properties' array.
 * @class
 * @implements {TypeConversionAction<POJObject>}
 */
export declare class PickPropertiesAction implements TypeConversionAction<POJObject> {
    transform(value: POJObject, options?: JSONObject): POJObject;
}
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
export declare class SetNestedValueAction<T> implements TypeConversionAction<T> {
    transform(value: T, options?: JSONObject): T;
    /**
     * Helper function that performs the actual value assignment for this action.
     * @function
     * @param {any} collection - top level value to be modified
     * @param {any} path - key or array of keys indicating the property to be set
     * @param {unknown} value - value to be used at the target location
     */
    setNestedValue(collection: any, path: any, value: unknown): void;
    /**
     * Helper function that creates a wrapper object or array, depending on the type of key provided.
     * @function
     * @param {any} key - key to be used
     * @Returns {POJObject | any[] | undefined} an empty object for string keys, an empty array for number keys, or undefined for an invalid key
     */
    createCollectionFor(key: any): POJObject | any[] | undefined;
}
/**
 * Removes a nested value within the provided object / array.
 * The path to the target value is taken from the option of the same name.
 * @template T
 * @class
 * @implements {TypeConversionAction<T>}
 */
export declare class DeleteNestedValueAction<T> implements TypeConversionAction<T> {
    transform(value: T, options?: JSONObject): T;
    /**
     * Helper function that performs the actual removal of the target value.
     * @function
     * @param {any} collection - object / array containing the target value
     * @param {any} path - key or key array to the target value.
     */
    deleteNestedValue(collection: any, path: any): void;
}
/**
 * Provides default actions for conversions to an object.
 * @const
 */
export declare const DEFAULT_OBJECT_ACTIONS: TypedActionMap<POJObject>;
/**
 * Handles conversion of a given value to an object.
 * @class
 * @implements {TypedActionsValueConvertor<POJObject>}
 */
export declare class ToObjectConvertor extends TypedActionsValueConvertor<POJObject> {
    readonly clone: (value: any) => any;
    constructor(actions?: TypedActionMap<POJObject>, cloneVia?: (value: any) => any);
    prepareValue(value: unknown, schema: Partial<TypeConversionSchema>, resolver?: TypeConversionResolver): unknown;
    finalizeValue(value: POJObject, schema: Partial<TypeConversionSchema>, resolver?: TypeConversionResolver, context?: TypeConversionContext): POJObject;
    /**
     * Helper function that enforces object schema restrictions on the target object.
     * @function
     * @param {Partial<TypeConversionSchema>} schema - schema to be used
     * @param {POJObject} value - object to be modified
     * @param TypeConversionResolver | undefined} resolver - conversion resolver to be used on nested values
     * @param {TypeConversionContext | undefined} context - additional values to be used for resolving references
     */
    applySchemaTo(schema: Partial<TypeConversionSchema>, target: POJObject, resolver?: TypeConversionResolver, context?: TypeConversionContext): void;
}
