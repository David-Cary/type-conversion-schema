import { type JSONSchema } from 'json-schema-typed';
export type JSONType = string | number | boolean | null | {
    [key: string]: JSONType;
} | JSONType[];
export type JSONObject = Record<string, JSONType>;
export interface TypeMarkedObject extends JSONObject {
    type: string;
}
export type TypedActionRequest = TypeMarkedObject | string;
export interface TypeConversionSchema {
    type: string;
    actions: TypedActionRequest[];
}
export interface TypeUnionSchema {
    anyOf: TypeConversionSchema[];
}
export type TypeConversionRequest = (TypeConversionSchema | TypeUnionSchema | string);
export interface TypeConversionAction<F = any, T = F> {
    transform: (value: F, options?: JSONObject, resolver?: TypeConversionResolver) => T;
    modifySchema?: (schema: JSONSchema, options?: JSONObject) => void;
}
export interface TypedValueConvertor<T = any> {
    matches: (value: unknown) => boolean;
    convert: (value: unknown) => T;
    convertWith: (value: unknown, actions: TypedActionRequest[], resolver?: TypeConversionResolver) => T;
    getAction: (key: string) => TypeConversionAction | undefined;
}
export declare const JSON_SCHEMA_TYPE_NAMES: string[];
export declare class TypeConversionResolver {
    readonly convertors: Record<string, TypedValueConvertor>;
    constructor(convertors?: Record<string, TypedValueConvertor>);
    getRequestSchema(request: TypeConversionRequest, value?: unknown): TypeConversionSchema | undefined;
    convert(value: unknown, castAs: TypeConversionRequest): unknown;
    getExpandedSchema(source: TypeConversionRequest, allowedTypes?: string[]): JSONSchema | undefined;
    getJSONSchema(source: TypeConversionRequest): JSONSchema | undefined;
}
