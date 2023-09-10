import { type TypeConversionAction, type TypedActionRequest, type TypeMarkedObject, type TypedValueConvertor, type TypeConversionResolver, type TypeConversionSchema, type TypeConversionContext } from '../schema/conversions';
import { type JSONObject } from '../schema/JSON';
/**
 * Retries a nested property value for a given path.
 * @function
 * @param {amy} source - object the value should be drawn from
 * @param {any} path - key or array of keys to use to get the value
 * @returns {any} retrieved value, if any
 */
export declare function getNestedValue(source: any, path: any): any;
/**
 * Handles redirecting to a nested value for the next step of a value conversion.
 * @class
 * @implements {TypeConversionAction}
 */
export declare class GetValueAction implements TypeConversionAction {
    transform(value: any, options?: JSONObject): any;
}
export declare function getActionRequestFrom(source: any): TypedActionRequest | undefined;
/**
 * Extracts a type convesion schema from the provided value.
 * @function
 * @param {any} source - value to draw the schema from
 * @returns {TypeConversionSchema | undefined} target schema, if any
 */
export declare function getConversionSchemaFrom(source: any): TypeConversionSchema | undefined;
/**
 * Applies a conversion schema to the current value before passing it on the next action.
 * @class
 * @implements {TypeConversionAction}
 */
export declare class NestedConversionAction implements TypeConversionAction {
    transform(value: any, options?: JSONObject, resolver?: TypeConversionResolver): any;
    expandSchema(schema: Partial<TypeConversionSchema>, options?: JSONObject, resolver?: TypeConversionResolver): void;
}
/**
 * Provides default conversion action handles for untyped values.
 * @const
 */
export declare const DEFAULT_UNTYPED_CONVERSIONS: {
    convert: NestedConversionAction;
    get: GetValueAction;
};
/**
 * Provides conversion action handlers, grouped by whether it's applied before, after, or during conversion.
 * @template T
 * @interface
 * @property {Record<string, TypeConversionAction<T>>} typed - actions to be performed after the type is set
 * @property {Record<string, TypeConversionAction<any>>} untyped - actions to be performed before the type is set
 * @property {Record<string, TypeConversionAction<any, T>>} typed - actions to be used to set the type
 */
export interface TypedActionMap<T> {
    typed: Record<string, TypeConversionAction<T>>;
    untyped: Record<string, TypeConversionAction<any>>;
    conversion: Record<string, TypeConversionAction<any, T>>;
}
/**
 * Handles conversion of a given value to a variety of types depending on the provided schema.
 * @template T
 * @class
 * @implements {TypedValueConvertor<T>}
 * @property {string} typeName - associated javascript schema type name
 * @property {(value: unknown) => T} convert - default function for conversion to the target type
 * @property {TypedActionMap<T>} actions - map of action resolution handlers
 */
export declare class TypedActionsValueConvertor<T = any> implements TypedValueConvertor<T> {
    readonly typeName: string;
    readonly convert: (value: unknown) => T;
    readonly actions: TypedActionMap<T>;
    constructor(typeName: string, convert: (value: unknown) => T, actions?: Partial<TypedActionMap<T>>);
    matches(value: unknown): boolean;
    convertWith(value: unknown, schema: Partial<TypeConversionSchema>, resolver?: TypeConversionResolver, context?: TypeConversionContext): T;
    /**
     * Applies pre-conversion actions to the provided value.
     * @function
     * @param {unknown} value - value to be modified
     * @param {Partial<TypeConversionSchema>} schema - schema to be used for conversion
     * @param TypeConversionResolver | undefined} resolver - conversion resolver to be used on nested values
     * @param {TypeConversionContext | undefined} context - additional values to be used for resolving references
     * @returns {unknown} modified value
     */
    prepareValue(value: unknown, schema: Partial<TypeConversionSchema>, resolver?: TypeConversionResolver, context?: TypeConversionContext): unknown;
    /**
     * Applies post-conversion actions to the provided value.
     * @function
     * @param {unknown} value - value to be modified
     * @param {Partial<TypeConversionSchema>} schema - schema to be used for conversion
     * @param TypeConversionResolver | undefined} resolver - conversion resolver to be used on nested values
     * @param {TypeConversionContext | undefined} context - additional values to be used for resolving references
     * @returns {unknown} modified value
     */
    finalizeValue(value: T, schema: Partial<TypeConversionSchema>, resolver?: TypeConversionResolver, context?: TypeConversionContext): T;
    expandActionRequest(request: TypedActionRequest): TypeMarkedObject;
    expandSchema(schema: Partial<TypeConversionSchema>, resolver?: TypeConversionResolver): void;
    /**
     * Applies pre-conversion actions to the provided schema.
     * @function
     * @param {Partial<TypeConversionSchema>} schema - schema to be modified
     * @param TypeConversionResolver | undefined} resolver - conversion resolver to be used on nested values
     */
    prepareSchema(schema: Partial<TypeConversionSchema>, resolver?: TypeConversionResolver): void;
    /**
     * Applies post-conversion actions to the provided schema.
     * @function
     * @param {Partial<TypeConversionSchema>} schema - schema to be modified
     * @param TypeConversionResolver | undefined} resolver - conversion resolver to be used on nested values
     */
    finalizeSchema(schema: Partial<TypeConversionSchema>, resolver?: TypeConversionResolver): void;
    /**
     * Helper function for applying schema updates from a particular action request.
     * @function
     * @param {Partial<TypeConversionSchema>} schema - schema to be modified
     * @param {TypedActionRequest} request - action request to be used
     * @param {Record<string, TypeConversionAction<any>>} actionMap - action map to use for the provided request
     * @param TypeConversionResolver | undefined} resolver - conversion resolver to be used on nested values
     */
    expandSchemaFor(schema: Partial<TypeConversionSchema>, request: TypedActionRequest, actionMap: Record<string, TypeConversionAction<any>>, resolver?: TypeConversionResolver): void;
}
