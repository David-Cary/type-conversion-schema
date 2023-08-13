import { JSONSchema } from 'json-schema-typed';
export interface AbstractJSTypeSchema {
    $comment?: string;
    $id?: string;
    $ref?: string;
    $schema?: string;
    description?: string;
    title?: string;
    definitions?: Record<string, JSTypeSchema>;
}
export interface TypedJSTypeSchema<T> extends AbstractJSTypeSchema {
    default?: T;
    examples?: T[];
    const?: T;
}
export interface NumericJSTypeSchema<T> extends TypedJSTypeSchema<T> {
    exclusiveMaximum?: T;
    exclusiveMinimum?: T;
    maximum?: T;
    minimum?: T;
    multipleOf?: T;
}
export interface AnySchema extends AbstractJSTypeSchema {
    type: 'any';
}
export interface ArraySchema<T = any> extends TypedJSTypeSchema<T[]> {
    type: 'array';
    additionalItems?: JSTypeSchema;
    contains?: JSTypeSchema;
    items?: JSTypeSchema;
    prefixItems?: JSTypeSchema[];
    maxItems?: number;
    minItems?: number;
    uniqueItems?: boolean;
}
export interface BigIntSchema extends NumericJSTypeSchema<bigint> {
    type: 'bigint';
}
export interface BooleanSchema extends TypedJSTypeSchema<boolean> {
    type: 'boolean';
}
export interface FunctionSchema extends TypedJSTypeSchema<Function> {
    type: 'function';
    parameters: JSTypeSchema[];
    returns: JSTypeSchema;
}
export interface ObjectSchema extends TypedJSTypeSchema<object> {
    type: 'object';
    additionalProperties?: JSTypeSchema;
    maxProperties?: number;
    minProperties?: number;
    patternProperties?: Record<string, JSTypeSchema>;
    properties?: Record<string, JSTypeSchema>;
    propertyNames?: StringSchema;
    required?: string[];
}
export interface NullSchema extends AbstractJSTypeSchema {
    type: 'null';
}
export interface NumberSchema extends NumericJSTypeSchema<number> {
    type: 'number' | 'integer';
}
export type JSONSchemaContentEncoding = ("7bit" | "8bit" | "base64" | "binary" | "ietf-token" | "quoted-printable" | "x-token");
export interface StringSchema extends TypedJSTypeSchema<string> {
    type: 'string';
    contentEncoding?: JSONSchemaContentEncoding;
    contentMediaType?: string;
    format?: string;
    maxLength?: number;
    minLength?: number;
    pattern?: string;
}
export interface SymbolSchema extends AbstractJSTypeSchema {
    type: 'symbol';
    key: string;
}
export interface UndefinedSchema extends AbstractJSTypeSchema {
    type: 'undefined';
}
export interface JSTypeSchemaUnion extends AbstractJSTypeSchema {
    anyOf: JSTypeSchema[];
}
export type JSTypeSchema = (AnySchema | ArraySchema | BigIntSchema | BooleanSchema | FunctionSchema | NumberSchema | NullSchema | ObjectSchema | StringSchema | SymbolSchema | UndefinedSchema | JSTypeSchemaUnion);
export declare const JSON_SCHEMA_TYPE_NAMES: string[];
export declare function JSTypeToJSONSchema(source: JSTypeSchema): JSONSchema | undefined;
export declare function JSTypeArrayToJSONSchema(source: JSTypeSchema[]): JSONSchema[];
export declare function JSTypeRecordToJSONSchema(source: Record<string, JSTypeSchema>): Record<string, JSONSchema>;
