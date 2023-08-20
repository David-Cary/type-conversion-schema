import { type JSONSchema } from 'json-schema-typed';
export interface AbstractJSTypeSchema {
    $comment?: string;
    $id?: string;
    $ref?: string;
    $schema?: string;
    description?: string;
    title?: string;
    definitions?: Record<string, JSTypeSchema>;
}
export interface TypedJSTypeSchema extends AbstractJSTypeSchema {
    type: string;
}
export interface VariedJSTypeSchema<T> extends TypedJSTypeSchema {
    default?: T;
    examples?: T[];
    const?: T;
}
export interface NumericJSTypeSchema<T> extends VariedJSTypeSchema<T> {
    integer?: boolean;
    exclusiveMaximum?: T;
    exclusiveMinimum?: T;
    maximum?: T;
    minimum?: T;
    multipleOf?: T;
}
export interface AnySchema extends VariedJSTypeSchema<any> {
    type: 'any';
}
export interface ArraySchema<T = any> extends VariedJSTypeSchema<T[]> {
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
export interface BooleanSchema extends VariedJSTypeSchema<boolean> {
    type: 'boolean';
}
export type AnyFunction = () => any;
export interface FunctionSchema extends VariedJSTypeSchema<AnyFunction> {
    type: 'function';
    parameters?: JSTypeSchema[];
    optionalParameters?: JSTypeSchema[];
    additionalParameters?: JSTypeSchema;
    returns?: JSTypeSchema;
}
export interface ObjectSchema extends VariedJSTypeSchema<object> {
    type: 'object';
    additionalProperties?: JSTypeSchema;
    maxProperties?: number;
    minProperties?: number;
    patternProperties?: Record<string, JSTypeSchema>;
    properties?: Record<string, JSTypeSchema>;
    propertyNames?: StringSchema;
    required?: string[];
}
export interface NullSchema extends TypedJSTypeSchema {
    type: 'null';
}
export interface NumberSchema extends NumericJSTypeSchema<number> {
    type: 'number';
}
export type JSONSchemaContentEncoding = ('7bit' | '8bit' | 'base64' | 'binary' | 'ietf-token' | 'quoted-printable' | 'x-token');
export interface StringSchema extends VariedJSTypeSchema<string> {
    type: 'string';
    contentEncoding?: JSONSchemaContentEncoding;
    contentMediaType?: string;
    format?: string;
    maxLength?: number;
    minLength?: number;
    pattern?: string;
}
export interface SymbolSchema extends TypedJSTypeSchema {
    type: 'symbol';
    key?: string;
}
export interface UndefinedSchema extends TypedJSTypeSchema {
    type: 'undefined';
}
export declare enum JSTypeName {
    ANY = "any",
    ARRAY = "array",
    BIG_INT = "bigint",
    BOOLEAN = "boolean",
    FUNCTION = "function",
    NUMBER = "number",
    NULL = "null",
    OBJECT = "object",
    STRING = "string",
    SYMBOL = "symbol",
    UNDEFINED = "undefined"
}
export type BasicJSTypeSchema = (AnySchema | ArraySchema | BigIntSchema | BooleanSchema | FunctionSchema | NumberSchema | NullSchema | ObjectSchema | StringSchema | SymbolSchema | UndefinedSchema);
export interface JSTypeSchemaUnion extends AbstractJSTypeSchema {
    anyOf: BasicJSTypeSchema[];
}
export type JSTypeSchema = BasicJSTypeSchema | JSTypeSchemaUnion;
export declare const JSON_SCHEMA_TYPE_NAMES: string[];
export declare function JSTypeToJSONSchema(source: JSTypeSchema): JSONSchema | undefined;
export type JSONSchemaObject = Exclude<JSONSchema, boolean>;
export declare function initJSONSchema(source: JSTypeSchema, schema: JSONSchemaObject): void;
export declare function initTypedJSONSchema<T>(source: VariedJSTypeSchema<T>, schema: JSONSchemaObject): void;
export declare function getTypedArray<F, T = F>(source: F[], convert: (value: F) => T | undefined): T[];
export declare function getTypedValueRecord<F, T = F>(source: Record<string, F>, convert: (value: F) => T | undefined): Record<string, T>;
export declare function getExtendedTypeOf(value: any): JSTypeName;
export declare function createBasicSchema(type: JSTypeName): BasicJSTypeSchema;
export declare function stringToJSTypeName(source: string): JSTypeName;
