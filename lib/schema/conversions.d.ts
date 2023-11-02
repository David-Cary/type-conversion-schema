import { type JSTypeSchema, type AbstractJSTypeSchema, type VariedJSTypeSchema, type NumericJSTypeSchema, type AnySchema, type ArraySchema, type BigIntSchema, type BooleanSchema, type FunctionSchema, type NumberSchema, type NullSchema, type ObjectSchema, type StringSchema, type SymbolSchema, type UndefinedSchema, type JSTypeSchemaReference, type AnyFunction, JSTypeName } from './JSType';
import { type JSONObject } from './JSON';
/**
 * Any object that uses a 'type' string to identify them.
 * @interface
 */
export interface TypeMarkedObject extends JSONObject {
    type: string;
}
/**
 * Used to request a particular type conversion or modification action.
 * @type {object | string}
 */
export type TypedActionRequest = TypeMarkedObject | string;
/**
 * Covers the actions used to convert a value, separated into distinct phases.
 * @interface
 * @property {TypedActionRequest[] | undefined} prepare - actions to apply before type change
 * @property {TypedActionRequest | undefined} cpmvertVia - actions to be used to enforce the type change
 * @property {TypedActionRequest[] | undefined} finalize - actions to apply after type change
 */
export interface TypeConversionCallbacks {
    prepare?: TypedActionRequest[];
    convertVia?: TypedActionRequest;
    finalize?: TypedActionRequest[];
}
/**
 * Adds type conversion callbacks to an AbstractJSTypeSchema's definitions.
 * @interface
 */
export interface AbstractTypeConversionSchema extends Omit<AbstractJSTypeSchema, '$defs'>, TypeConversionCallbacks {
    $defs?: Record<string, TypeConversionSchema | TypeConversionSchemaUnion>;
}
/**
 * Adds type conversion callbacks to an ArraySchema's subschema properties.
 * @interface
 */
export interface ArrayCreationSchema extends Omit<ArraySchema, 'additionalItems' | 'contains' | 'items' | 'prefixItems'>, TypeConversionCallbacks {
    additionalItems?: TypeConversionRequest;
    contains?: TypeConversionRequest;
    items?: TypeConversionRequest;
    prefixItems?: TypeConversionRequest[];
}
/**
 * Adds type conversion callbacks to a FunctionSchema's subschema properties.
 * @interface
 */
export interface FunctionCreationSchema extends Omit<FunctionSchema, 'parameters' | 'optionalParameters' | 'additionalParameters' | 'returns'>, TypeConversionCallbacks {
    parameters?: TypeConversionRequest[];
    optionalParameters?: TypeConversionRequest[];
    additionalParameters?: TypeConversionRequest;
    returns?: TypeConversionRequest;
}
/**
 * Adds type conversion callbacks to an ObjectSchema's subschema properties.
 * @interface
 */
export interface ObjectCreationSchema extends Omit<ObjectSchema, 'additionalProperties' | 'patternProperties' | 'properties'>, TypeConversionCallbacks {
    additionalProperties?: TypeConversionRequest;
    patternProperties?: Record<string, TypeConversionRequest>;
    properties?: Record<string, TypeConversionRequest>;
}
/**
 * Covers adding type converion callbacks to BasicJSTypeSchemas.
 * @type {object}
 */
export type TypeConversionSchema = (((AnySchema | BigIntSchema | BooleanSchema | NumberSchema | NullSchema | StringSchema | SymbolSchema | UndefinedSchema) & AbstractTypeConversionSchema) | ArrayCreationSchema | FunctionCreationSchema | ObjectCreationSchema);
/**
 * Adds type conversion callbacks to an JSTypeSchemaUnion's subschema properties.
 * @interface
 */
export interface TypeConversionSchemaUnion extends AbstractTypeConversionSchema {
    anyOf: TypeConversionRequest[];
}
/**
 * All data types that can be used to determine how a data type conversion should be handled.
 * @type {object | JSTypeName}
 */
export type TypeConversionRequest = (TypeConversionSchema | TypeConversionSchemaUnion | JSTypeSchemaReference | JSTypeName);
/**
 * Ensures a TypeConversionRequest is in an object format.
 * @function
 * @param {TypeConversionRequest} request - request to be coverted.
 * @returns {JSONSchema} resulting conversion schema, union, or reference
 */
export declare function parseTypeConversionRequest(request: TypeConversionRequest): TypeConversionSchema | TypeConversionSchemaUnion | JSTypeSchemaReference;
/**
 * Strips type conversion callbacks from a TypeConversionSchema.
 * @function
 * @param {TypeConversionSchema} schema - schema to be modified
 */
export declare function removeTypeConversionActionsFrom(schema: TypeConversionSchema): void;
/**
 * Converts a TypeConversionRequest to a javascript type schema.
 * @function
 * @param {TypeConversionRequest} request - request to be coverted
 * @returns {JSTypeSchema} resulting JSON javascript type schema
 */
export declare function typeConversionToJSTypeSchema(request: TypeConversionRequest): JSTypeSchema;
/**
 * Gets a copy of the target object with all properties converted.
 * @template F, T
 * @function
 * @param {Record<string, F>} source - value to be coverted
 * @param {(value: F) => T} convert - conversion function to be used
 * @returns {Record<string, F>} resulting copied value map
 */
export declare function convertRecordValues<F, T>(source: Record<string, F>, convert: (value: F) => T): Record<string, T>;
/**
 * Defines an operation for modifying a given value.
 * @template F, T
 * @interface
 */
export interface TypeConversionAction<F = any, T = F> {
    /**
     * Performs the target modification on a given value.
     * @function
     * @param {F} value - value to be modified
     * @param {JSONObject | undefined} options - optional modification values to be used
     * @param TypeConversionResolver | undefined} resolver - conversion resolver to be used on nested values
     * @returns {T} resulting value after modification is performed
     */
    transform: (value: F, options?: JSONObject, resolver?: TypeConversionResolver) => T;
    /**
     * Updates the provided type conversion schema to reflect the results of applying this action.
     * @function
     * @param {Partial<TypeConversionSchema>} schema - schema to be modified
     * @param {JSONObject | undefined} options - optional modification values to be used
     * @param TypeConversionResolver | undefined} resolver - conversion resolver to be used on nested values
     */
    expandSchema?: (schema: Partial<TypeConversionSchema>, options?: JSONObject, resolver?: TypeConversionResolver) => void;
}
/**
 * Tries to cast the provided value to an action request.
 * @function
 * @param {amy} source - value to be cast
 * @returns {any} recast value, if valid
 */
export declare function getActionRequestFrom(source: any): TypedActionRequest | undefined;
/**
 * Contains additional information for resolving a given type conversion request.
 * This is primarily used to resolver references within the schema.
 * @interface
 * @property {Record<string, TypeConversionSchema>} schemas - map of schema definitions to use
 * @property {TypeConversionSchema | undefined} parent - parent schema to draw definitions from
 */
export interface TypeConversionContext {
    schemas: Record<string, TypeConversionSchema>;
    parent?: TypeConversionSchema;
}
/**
 * Handles converting an unknown value to a particular data type.
 * @template T
 * @interface
 */
export interface TypedValueConvertor<T = any> {
    /**
     * Checks if a given value is of the intended type
     * @function
     * @param {unknown} value - value to be evaluated
     * @returns {boolean} true if the value is of the intended type
     */
    matches: (value: unknown) => boolean;
    /**
     * Converts the provided value to the intended type.
     * @function
     * @param {unknown} value - value to be converted
     * @returns {T} converted value
     */
    convert: (value: unknown) => T;
    /**
     * Converts the provided value using a particular schema.
     * @function
     * @param {unknown} value - value to be converted
     * @param {Partial<TypeConversionSchema>} schema - schema to be used for conversion
     * @param TypeConversionResolver | undefined} resolver - conversion resolver to be used on nested values
     * @param {TypeConversionContext | undefined} context - additional values to be used for resolving references
     * @returns {T} converted value
     */
    convertWith: (value: unknown, schema: Partial<TypeConversionSchema>, resolver?: TypeConversionResolver, context?: TypeConversionContext) => T;
    /**
     * Updates the provided type conversion schema to reflect the results of applying this action.
     * @function
     * @param {Partial<TypeConversionSchema>} schema - schema to be modified
     * @param TypeConversionResolver | undefined} resolver - conversion resolver to be used on nested values
     */
    expandSchema?: (schema: Partial<TypeConversionSchema>, resolver?: TypeConversionResolver) => void;
}
/**
 * Handles conversion of a given value to a variety of types depending on the provided schema.
 * @class
 * @property {Record<string, TypedValueConvertor>} convertors - map of type specific conversion objects, keyed by type name
 */
export declare class TypeConversionResolver {
    readonly convertors: Record<string, TypedValueConvertor>;
    constructor(convertors?: Record<string, TypedValueConvertor>);
    /**
     * Tries to get the appropriate schema for resolving a given request.
     * @function
     * @param {TypeConversionRequest} request - conversion request to be used
     * @param {unknown} value - value to be converted
     * @param {TypeConversionContext | undefined} context - additional values to be used for resolving references
     * @returns {T} type conversion schema to use, if an appropriate one is found
     */
    getRequestSchema(request: TypeConversionRequest, value?: unknown, context?: TypeConversionContext): TypeConversionSchema | undefined;
    /**
     * Returns a TypeConversionContext with the provided schema as the parent.
     * @function
     * @param {TypeConversionSchema} parent - schema to set as the parent
     * @param {TypeConversionContext | undefined} base - source of default context values
     * @returns {T} resulting subcontext
     */
    getChildContext(parent: TypeConversionSchema, base?: TypeConversionContext): TypeConversionContext;
    /**
     * Resolves a schema reference to the indicated schema.
     * @function
     * @param {JSTypeSchemaReference} reference - reference to be resolved
     * @param {TypeConversionContext | undefined} context - additional values to be used for resolving references
     * @param {TypeConversionSchema} defaultSchema - schema to be used if reference is unresolved
     * @returns {T} converted value
     */
    resolveReference(reference: JSTypeSchemaReference, context?: TypeConversionContext, defaultSchema?: TypeConversionSchema): TypeConversionSchema | TypeConversionSchemaUnion;
    /**
     * Converts the provided value as specified by a conversion request.
     * @function
     * @param {unknown} value - value to be converted
     * @param {TypeConversionRequest} castAs - details what the value should be converted to
     * @param {TypeConversionContext | undefined} context - additional values to be used for resolving references
     * @returns {unknown} converted value
     */
    convert(value: unknown, castAs: TypeConversionRequest, context?: TypeConversionContext): unknown;
    /**
     * Updates all subschemas of the provided schema to reflect all effects of applying said subschemas.
     * This can also be used to convert a string request to a full schema.
     * @function
     * @param {TypeConversionRequest} source - request to be evaluated
     * @returns {T} resulting expanded schema, union, or reference
     */
    getExpandedSchema(source: TypeConversionRequest): TypeConversionSchema | TypeConversionSchemaUnion | JSTypeSchemaReference;
}
/**
 * Extracts a type convesion schema from the provided value.
 * @function
 * @param {any} source - value to draw the schema from
 * @returns {TypeConversionSchema | undefined} target schema, if any
 */
export declare function getConversionSchemaFrom(source: any): TypeConversionSchema | TypeConversionSchemaUnion | JSTypeSchemaReference;
/**
 * Copies properties common to all types of conversion schemas from a source object.
 * @function
 * @param {AbstractTypeConversionSchema} schema - conversion schema to be modified
 * @param {Record<string, any>} source - values to be copied
 */
export declare function initAbstractConversionSchemaFrom(schema: AbstractTypeConversionSchema, source: Record<string, any>): void;
/**
 * Copies properties for multi-value conversion schemas from a source object.
 * @function
 * @template T
 * @param {TypeConversionSchema & VariedJSTypeSchema<T>} schema - conversion schema to be modified
 * @param {Record<string, any>} source - values to be copied
 * @param {(value: any) => T}
 */
export declare function initVariedConversionSchemaFrom<T>(schema: TypeConversionSchema & VariedJSTypeSchema<T>, source: Record<string, any>, convert: (value: any) => T): void;
/**
 * Copies properties for numeric conversion schemas from a source object.
 * @function
 * @template T
 * @param {TypeConversionSchema & NumericJSTypeSchema<T>} schema - conversion schema to be modified
 * @param {Record<string, any>} source - values to be copied
 * @param {(value: any) => T}
 */
export declare function initNumericConversionSchemaFrom<T>(schema: TypeConversionSchema & NumericJSTypeSchema<T>, source: Record<string, any>, convert: (value: any) => T): void;
/**
 * Copies properties for array conversion schemas from a source object.
 * @function
 * @param {ArrayCreationSchema} schema - conversion schema to be modified
 * @param {Record<string, any>} source - values to be copied
 */
export declare function initArrayConversionSchemaFrom(schema: ArrayCreationSchema, source: Record<string, any>): void;
/**
 * Copies properties for function conversion schemas from a source object.
 * @function
 * @param {FunctionCreationSchema} schema - conversion schema to be modified
 * @param {Record<string, any>} source - values to be copied
 */
export declare function initFunctionConversionSchemaFrom(schema: FunctionCreationSchema, source: Record<string, any>): void;
/**
 * Copies properties for object conversion schemas from a source object.
 * @function
 * @param {ObjectCreationSchema} schema - conversion schema to be modified
 * @param {Record<string, any>} source - values to be copied
 */
export declare function initObjectConversionSchemaFrom(schema: ObjectCreationSchema, source: Record<string, any>): void;
/**
 * Copies properties for string conversion schemas from a source object.
 * @function
 * @param {TypeConversionSchema & StringSchem} schema - conversion schema to be modified
 * @param {Record<string, any>} source - values to be copied
 */
export declare function initStringConversionSchemaFrom(schema: TypeConversionSchema & StringSchema, source: Record<string, any>): void;
/**
 * Copies properties for symbol conversion schemas from a source object.
 * @function
 * @param {TypeConversionSchema & SymbolSchema} schema - conversion schema to be modified
 * @param {Record<string, any>} source - values to be copied
 */
export declare function initSymbolConversionSchemaFrom(schema: TypeConversionSchema & SymbolSchema, source: Record<string, any>): void;
/**
 * Retrives the first key that corresponds to a particular value within a given collection.
 * @function
 * @param {Record<string, any>} collection - value map to be evaluated
 * @param {any} value = value to be searched for
 * @returns {string | undefined} first matching key
 */
export declare function getValueKey(collection: Record<string, any>, value: any): string | undefined;
/**
 * Converts the provided value to an array.
 * This involves wrapping non-array values in an array with undefined values excluded.
 * @function
 * @param {unknown} source - value to be converted
 * @returns {any[]} source array or enclosing array for non-array sources
 */
export declare function getArrayFrom(source: unknown): any[];
/**
 * Converts the provided value to a BigInt.
 * This involves wrapping non-array values in an array with undefined values excluded.
 * @function
 * @param {unknown} source - value to be converted
 * @returns {any} source array or enclosing array for non-array sources
 */
export declare function getBigIntFrom(value: any, defaultValue?: bigint): bigint;
/**
 * Converts the provided value to a function.
 * If the value isn't already a function it will be wrapped in a fuction that returns that value.
 * @function
 * @param {any} source - value to be converted
 * @returns {AnyFunction} resulting function
 */
export declare function getFunctionFrom(value: any): AnyFunction;
/**
 * Refers to any plain old javascript object.
 * @type {Record<string, unknown>}
 */
export type POJObject = Record<string, unknown>;
/**
 * Converts the provided value to an object.
 * For arrays, this means remapping items to keys that match their indices.
 * For strings, JSON parse is attempted.
 * Any other values or a failed parse result in an empty object.
 * @function
 * @param {any} source - value to be converted
 * @returns {string} resulting object
 */
export declare function getObjectFrom(source: unknown): POJObject;
/**
 * Converts the provided value to a symbol.
 * String are handled directly by the 'Symbol' function.
 * Any other values that aren't already symbols are converted to strings
 * before being passed to said function.
 * @function
 * @param {any} source - value to be converted
 * @returns {string} resulting object
 */
export declare function getSymbolFrom(value: any): symbol;
/**
 * Callback to be used as the replacer function in JSON stringify calls.
 * @type {Function}
 */
export type StringifyReplacerCallback = (this: any, key: string, value: any) => any;
/**
 * Provides a fallback to failed JSON stringify attempts.
 * @function
 * @param {any} source - value to be converted
 * @param {StringifyReplacerCallback | Array<string | number> | null | undefined} replacer - replacer to pass in to JSON stringify.
 * @param {number | string} space - spacing value to be used by JSON stringify
 * @returns {string} resulting string
 */
export declare function safeJSONStringify(source: any, replacer?: StringifyReplacerCallback | Array<string | number> | null, space?: number | string): string;
export declare class InterfaceEnforcer<T extends object> {
    readonly schema: ObjectCreationSchema;
    constructor(schema: ObjectCreationSchema);
    applyTo(value: Record<string, any>, resolver: TypeConversionResolver, context?: TypeConversionContext): T;
}
