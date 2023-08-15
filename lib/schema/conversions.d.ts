import { type JSTypeSchema, type BasicJSTypeSchema } from './JSType';
import { type JSONObject } from './JSON';
export interface TypeMarkedObject extends JSONObject {
    type: string;
}
export type TypedActionRequest = TypeMarkedObject | string;
export interface TypeConversionSchema {
    type: string;
    prepare?: TypedActionRequest[];
    convertVia?: TypedActionRequest;
    finalize?: TypedActionRequest[];
}
export interface TypeConversionSchemaUnion {
    anyOf: Array<TypeConversionSchema | string>;
}
export type TypeConversionRequest = (TypeConversionSchema | TypeConversionSchemaUnion | string);
export interface TypeConversionAction<F = any, T = F> {
    transform: (value: F, options?: JSONObject, resolver?: TypeConversionResolver) => T;
    createSchema?: (options?: JSONObject, resolver?: TypeConversionResolver) => BasicJSTypeSchema;
    modifySchema?: (schema: BasicJSTypeSchema, options?: JSONObject, resolver?: TypeConversionResolver) => BasicJSTypeSchema;
}
export interface TypedValueConvertor<T = any> {
    matches: (value: unknown) => boolean;
    convert: (value: unknown) => T;
    convertWith: (value: unknown, schema: Partial<TypeConversionSchema>, resolver?: TypeConversionResolver) => T;
    createJSTypeSchema: (source?: Partial<TypeConversionSchema>, resolver?: TypeConversionResolver) => BasicJSTypeSchema;
}
export declare class TypeConversionResolver {
    readonly convertors: Record<string, TypedValueConvertor>;
    constructor(convertors?: Record<string, TypedValueConvertor>);
    getRequestSchema(request: TypeConversionRequest, value?: unknown): TypeConversionSchema | undefined;
    convert(value: unknown, castAs: TypeConversionRequest): unknown;
    createJSTypeSchema(source: TypeConversionRequest): JSTypeSchema | undefined;
}
