import { type JSONSchema } from 'json-schema-typed';
/**
 * Covers the basic properties shared by all javascript type schemas.
 * These mirror the properties common to all JSON schema objects.
 * @interface
 */
export interface AbstractJSTypeSchema {
    $comment?: string;
    $id?: string;
    $defs?: Record<string, BasicJSTypeSchema | JSTypeSchemaUnion>;
    $schema?: string;
    $anchor?: string;
    description?: string;
    title?: string;
}
/**
 * Adds typing to a javascript type schema.
 * This should be extended by every such schema save union shemas.
 * @interface
 */
export interface TypedJSTypeSchema extends AbstractJSTypeSchema {
    type: string;
}
/**
 * This adds properties for schemas that can have multiple values.
 * As such it's used for most schemas that aren't fixed values like null and undefined.
 * @interface
 */
export interface VariedJSTypeSchema<T> extends TypedJSTypeSchema {
    default?: T;
    examples?: T[];
    const?: T;
}
/**
 * Covers numeric javascript values (number and big int).
 * @interface
 */
export interface NumericJSTypeSchema<T> extends VariedJSTypeSchema<T> {
    integer?: boolean;
    exclusiveMaximum?: T;
    exclusiveMinimum?: T;
    maximum?: T;
    minimum?: T;
    multipleOf?: T;
}
/**
 * Acts as a wildcard for values with no typing or where the type is unknow.
 * This makes it equivalent to "true" in a JSON schema.
 * @interface
 */
export interface AnySchema extends VariedJSTypeSchema<any> {
    type: 'any';
}
/**
 * Adds JSON schema array properties to a javascript type schema.
 * @interface
 */
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
/**
 * Javascript type schema for big integers.
 * @interface
 */
export interface BigIntSchema extends NumericJSTypeSchema<bigint> {
    type: 'bigint';
}
/**
 * Javascript type schema for boolean values.
 * @interface
 */
export interface BooleanSchema extends VariedJSTypeSchema<boolean> {
    type: 'boolean';
}
export type AnyFunction = () => any;
/**
 * Javascript type schema for functions.
 * @interface
 */
export interface FunctionSchema extends VariedJSTypeSchema<AnyFunction> {
    type: 'function';
    parameters?: JSTypeSchema[];
    optionalParameters?: JSTypeSchema[];
    additionalParameters?: JSTypeSchema;
    returns?: JSTypeSchema;
}
/**
 * Adds JSON schema object properties to a javascript type schema.
 * @interface
 */
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
/**
 * Javascript type schema for numbers.
 * @interface
 */
export interface NullSchema extends TypedJSTypeSchema {
    type: 'null';
}
/**
 * Javascript type schema for null values.
 * @interface
 */
export interface NumberSchema extends NumericJSTypeSchema<number> {
    type: 'number';
}
export type JSONSchemaContentEncoding = ('7bit' | '8bit' | 'base64' | 'binary' | 'ietf-token' | 'quoted-printable' | 'x-token');
/**
 * Adds JSON schema string properties to a javascript type schema.
 * @interface
 */
export interface StringSchema extends VariedJSTypeSchema<string> {
    type: 'string';
    contentEncoding?: JSONSchemaContentEncoding;
    contentMediaType?: string;
    format?: string;
    maxLength?: number;
    minLength?: number;
    pattern?: string;
}
/**
 * Javascript type schema for symbols.
 * @interface
 */
export interface SymbolSchema extends TypedJSTypeSchema {
    type: 'symbol';
    key?: string;
}
/**
 * Javascript type schema for undefined values.
 * @interface
 */
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
/**
 * Cover all javascript type schemas with a specific type (including any).
 * @type {object}
 */
export type BasicJSTypeSchema = (AnySchema | ArraySchema | BigIntSchema | BooleanSchema | FunctionSchema | NumberSchema | NullSchema | ObjectSchema | StringSchema | SymbolSchema | UndefinedSchema);
/**
 * Covers javascript type schemas with multiple valid sub-types.
 * @interface
 */
export interface JSTypeSchemaUnion extends AbstractJSTypeSchema {
    anyOf: BasicJSTypeSchema[];
}
/**
 * Used to implement JSON schema style references within a javascript type schema.
 * @interface
 */
export interface JSTypeSchemaReference {
    $ref: string;
}
/**
 * Covers all valid objects within a javascript type schema.
 * @type
 */
export type JSTypeSchema = (BasicJSTypeSchema | JSTypeSchemaUnion | JSTypeSchemaReference);
export declare const JSON_SCHEMA_TYPE_NAMES: string[];
/**
 * Converts a javascript type schema to a JSON shema.
 * @function
 * @param {JSTypeSchema} source - javascript type schema to be coverted.
 * @returns {JSONSchema} resulting JSON schema, provided such a conversion is possible
 */
export declare function JSTypeToJSONSchema(source: JSTypeSchema): JSONSchema | undefined;
export type JSONSchemaObject = Exclude<JSONSchema, boolean>;
/**
 * Copies AbstractJSTypeSchema properties onto a JSON schema.
 * @function
 * @param {JSTypeSchema} source - javascript type schema we're copying
 * @param {JSONSchemaObject} shema - JSON schema we're modifying
 */
export declare function initJSONSchema(source: JSTypeSchema, schema: JSONSchemaObject): void;
/**
 * Copies VariedJSTypeSchema specific properties onto a JSON schema.
 * @function
 * @param {JSTypeSchema} source - javascript type schema we're copying
 * @param {JSONSchemaObject} shema - JSON schema we're modifying
 */
export declare function initTypedJSONSchema<T>(source: VariedJSTypeSchema<T>, schema: JSONSchemaObject): void;
/**
 * Tries to map array items to a new type while filtering out null/undefined values.
 * @template F, T
 * @function
 * @param {F[]} source - items to be converted
 * @param {(value: F) => T | undefined} convert - callback used to perform conversions
 * @returns {JSONSchema} list of successfully converted items.
 */
export declare function getTypedArray<F, T = F>(source: F[], convert: (value: F) => T | undefined): T[];
/**
 * Tries to map object values to a new type while filtering out null/undefined values.
 * @template F, T
 * @function
 * @param {F[]} source - object to be converted
 * @param {(value: F) => T | undefined} convert - callback used to perform conversions
 * @returns {JSONSchema} map of successfully converted values.
 */
export declare function getTypedValueRecord<F, T = F>(source: Record<string, F>, convert: (value: F) => T | undefined): Record<string, T>;
/**
 * Acts as variant of 'typeof' with special handling for null values and arrays.
 * @function
 * @param {any} value - value to be evaluated
 * @returns {JSTypeName} valid type name for the provided value
 */
export declare function getExtendedTypeOf(value: any): JSTypeName;
/**
 * Creates a javascript type shema from a type name.
 * @function
 * @param {JSTypeName} type - type name to be used
 * @returns {JSONSchema} resulting javascript type schema
 */
export declare function createBasicSchema(type: JSTypeName): BasicJSTypeSchema;
/**
 * Converts a string to it's corresponding javascript type name, defaulting to 'any'.
 * @function
 * @param {string} source - type string to be converted
 * @returns {JSONSchema} the provided string if it was a valid type or 'any' if it wasn't
 */
export declare function stringToJSTypeName(source: string): JSTypeName;
