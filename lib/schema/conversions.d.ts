import { type JSTypeSchema, type AbstractJSTypeSchema, type AnySchema, type ArraySchema, type BigIntSchema, type BooleanSchema, type FunctionSchema, type NumberSchema, type NullSchema, type ObjectSchema, type StringSchema, type SymbolSchema, type UndefinedSchema, type JSTypeSchemaReference, JSTypeName } from './JSType';
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
export interface AbstractTypeConversionSchema extends Omit<AbstractJSTypeSchema, '$defs'>, TypeConversionCallbacks {
    $defs?: Record<string, TypeConversionSchema | TypeConversionSchemaUnion>;
}
export interface ArrayCreationSchema extends Omit<ArraySchema, 'additionalItems' | 'contains' | 'items' | 'prefixItems'>, TypeConversionCallbacks {
    additionalItems?: TypeConversionRequest;
    contains?: TypeConversionRequest;
    items?: TypeConversionRequest;
    prefixItems?: TypeConversionRequest[];
}
export interface FunctionCreationSchema extends Omit<FunctionSchema, 'parameters' | 'optionalParameters' | 'additionalParameters' | 'returns'>, TypeConversionCallbacks {
    parameters?: TypeConversionRequest[];
    optionalParameters?: TypeConversionRequest[];
    additionalParameters?: TypeConversionRequest;
    returns?: TypeConversionRequest;
}
export interface ObjectCreationSchema extends Omit<ObjectSchema, 'additionalProperties' | 'patternProperties' | 'properties'>, TypeConversionCallbacks {
    additionalProperties?: TypeConversionRequest;
    patternProperties?: Record<string, TypeConversionRequest>;
    properties?: Record<string, TypeConversionRequest>;
}
export type TypeConversionSchema = (((AnySchema | BigIntSchema | BooleanSchema | NumberSchema | NullSchema | StringSchema | SymbolSchema | UndefinedSchema) & AbstractTypeConversionSchema) | ArrayCreationSchema | FunctionCreationSchema | ObjectCreationSchema);
export interface TypeConversionSchemaUnion extends AbstractJSTypeSchema {
    anyOf: Array<TypeConversionSchema | JSTypeName>;
}
export type TypeConversionRequest = (TypeConversionSchema | TypeConversionSchemaUnion | JSTypeSchemaReference | JSTypeName);
export declare function parseTypeConversionRequest(request: TypeConversionRequest): TypeConversionSchema | TypeConversionSchemaUnion | JSTypeSchemaReference;
export declare function removeTypeConversionActionsFrom(schema: TypeConversionSchema): void;
export declare function typeConversionToJSTypeSchema(request: TypeConversionRequest): JSTypeSchema;
export declare function convertRecordValues<F, T>(source: Record<string, F>, convert: (value: F) => T): Record<string, T>;
export interface TypeConversionAction<F = any, T = F> {
    transform: (value: F, options?: JSONObject, resolver?: TypeConversionResolver) => T;
    expandSchema?: (schema: Partial<TypeConversionSchema>, options?: JSONObject, resolver?: TypeConversionResolver) => void;
}
export interface TypeConversionContext {
    schemas: Record<string, TypeConversionSchema>;
    parent?: TypeConversionSchema;
}
export interface TypedValueConvertor<T = any> {
    matches: (value: unknown) => boolean;
    convert: (value: unknown) => T;
    convertWith: (value: unknown, schema: Partial<TypeConversionSchema>, resolver?: TypeConversionResolver, context?: TypeConversionContext) => T;
    expandSchema?: (schema: Partial<TypeConversionSchema>, resolver?: TypeConversionResolver) => void;
}
export declare class TypeConversionResolver {
    readonly convertors: Record<string, TypedValueConvertor>;
    constructor(convertors?: Record<string, TypedValueConvertor>);
    getRequestSchema(request: TypeConversionRequest, value?: unknown, context?: TypeConversionContext): TypeConversionSchema | undefined;
    getChildContext(parent: TypeConversionSchema, base?: TypeConversionContext): TypeConversionContext;
    resolveReference(reference: JSTypeSchemaReference, context?: TypeConversionContext, defaultSchema?: TypeConversionSchema): TypeConversionSchema | TypeConversionSchemaUnion;
    convert(value: unknown, castAs: TypeConversionRequest, context?: TypeConversionContext): unknown;
    getExpandedSchema(source: TypeConversionRequest): TypeConversionSchema | TypeConversionSchemaUnion | JSTypeSchemaReference;
}
