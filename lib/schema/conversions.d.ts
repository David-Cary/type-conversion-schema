import { type JSTypeSchema, type AbstractJSTypeSchema, type BasicJSTypeSchema, type AnySchema, type ArraySchema, type BigIntSchema, type BooleanSchema, type FunctionSchema, type NumberSchema, type NullSchema, type ObjectSchema, type StringSchema, type SymbolSchema, type UndefinedSchema, type JSTypeName } from './JSType';
import { type JSONObject } from './JSON';
export interface TypeMarkedObject extends JSONObject {
    type: string;
}
export type TypedActionRequest = TypeMarkedObject | string;
export interface TypeConversionCallbacks {
    prepare?: TypedActionRequest[];
    convertVia?: TypedActionRequest;
    finalize?: TypedActionRequest[];
}
export type BasicTypeConversionSchema = BasicJSTypeSchema & TypeConversionCallbacks;
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
export type TypeConversionSchema = (((AnySchema | BigIntSchema | BooleanSchema | NumberSchema | NullSchema | StringSchema | SymbolSchema | UndefinedSchema) & TypeConversionCallbacks) | ArrayCreationSchema | FunctionCreationSchema | ObjectCreationSchema);
export interface TypeConversionSchemaUnion extends AbstractJSTypeSchema {
    anyOf: Array<TypeConversionSchema | JSTypeName>;
}
export type TypeConversionRequest = (TypeConversionSchema | TypeConversionSchemaUnion | JSTypeName);
export declare function parseTypeConversionRequest(request: TypeConversionRequest): TypeConversionSchema | TypeConversionSchemaUnion;
export declare function removeTypeConversionActionsFrom(schema: TypeConversionSchema): void;
export declare function typeConversionToJSTypeSchema(request: TypeConversionRequest): JSTypeSchema;
export declare function convertRecordValues<F, T>(source: Record<string, F>, convert: (value: F) => T): Record<string, T>;
export interface TypeConversionAction<F = any, T = F> {
    transform: (value: F, options?: JSONObject, resolver?: TypeConversionResolver) => T;
    expandSchema?: (schema: Partial<TypeConversionSchema>, options?: JSONObject, resolver?: TypeConversionResolver) => void;
}
export interface TypedValueConvertor<T = any> {
    matches: (value: unknown) => boolean;
    convert: (value: unknown) => T;
    convertWith: (value: unknown, schema: Partial<TypeConversionSchema>, resolver?: TypeConversionResolver) => T;
    expandSchema?: (schema: Partial<TypeConversionSchema>, resolver?: TypeConversionResolver) => void;
}
export declare class TypeConversionResolver {
    readonly convertors: Record<string, TypedValueConvertor>;
    constructor(convertors?: Record<string, TypedValueConvertor>);
    getRequestSchema(request: TypeConversionRequest, value?: unknown): TypeConversionSchema | undefined;
    convert(value: unknown, castAs: TypeConversionRequest): unknown;
    getExpandedSchema(source: TypeConversionRequest): TypeConversionSchema | TypeConversionSchemaUnion;
}
