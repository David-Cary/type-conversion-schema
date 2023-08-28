import { type JSTypeSchema, type AbstractJSTypeSchema, type BasicJSTypeSchema, type JSTypeName } from './JSType';
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
export type TypeConversionSchema = BasicJSTypeSchema & TypeConversionCallbacks;
export interface TypeConversionSchemaUnion extends AbstractJSTypeSchema {
    anyOf: Array<TypeConversionSchema | JSTypeName>;
}
export type TypeConversionRequest = (TypeConversionSchema | TypeConversionSchemaUnion | JSTypeName);
export declare function parseTypeConversionRequest(request: TypeConversionRequest): TypeConversionSchema | TypeConversionSchemaUnion;
export declare function removeTypeConversionActionsFrom(schema: TypeConversionSchema): void;
export interface TypeConversionAction<F = any, T = F> {
    transform: (value: F, options?: JSONObject, resolver?: TypeConversionResolver) => T;
    expandSchema?: (schema: Partial<TypeConversionSchema>, options?: JSONObject, resolver?: TypeConversionResolver) => void;
}
export interface TypedValueConvertor<T = any> {
    matches: (value: unknown) => boolean;
    convert: (value: unknown) => T;
    convertWith: (value: unknown, schema: Partial<TypeConversionSchema>, resolver?: TypeConversionResolver) => T;
    expandSchema?: (schema: Partial<TypeConversionSchema>, resolver?: TypeConversionResolver) => void;
    createJSTypeSchema: (source?: Partial<TypeConversionSchema>, resolver?: TypeConversionResolver) => BasicJSTypeSchema;
}
export declare class TypeConversionResolver {
    readonly convertors: Record<string, TypedValueConvertor>;
    constructor(convertors?: Record<string, TypedValueConvertor>);
    getRequestSchema(request: TypeConversionRequest, value?: unknown): TypeConversionSchema | undefined;
    convert(value: unknown, castAs: TypeConversionRequest): unknown;
    getExpandedSchema(source: TypeConversionRequest): TypeConversionSchema | TypeConversionSchemaUnion;
    createJSTypeSchema(source: TypeConversionRequest): JSTypeSchema | undefined;
}
