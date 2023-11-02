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
 * Helper function used to generate schema for optional properties
 * @function
 * @param {JSTypeSchema} options - acceptable types other than undefined
 * @returns {string} resulting schema
 */
export declare function getOptionalPropertySchema(options: JSTypeSchema[]): JSTypeSchemaUnion;
/**
 * Helper function to get the schemas for each property of the AbstractJSTypeSchema interface.
 * @function
 * @returns {string} map of interface's property schemas
 */
export declare function getAbstractJSTypeProperties(): Record<string, JSTypeSchema>;
/**
 * Adds typing to a javascript type schema.
 * This should be extended by every such schema save union shemas.
 * @interface
 */
export interface TypedJSTypeSchema extends AbstractJSTypeSchema {
    type: string;
}
/**
 * Helper function to get the schemas for each property of a particular TypedJSTypeSchema.
 * @function
 * @param (string) type - type name of t
 * @returns {string} map of interface's property schemas
 */
export declare function getTypedJSTypeProperties(type: string): Record<string, JSTypeSchema>;
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
 * Helper function to get the schemas for each property of a particular VariedJSTypeSchema.
 * @function
 * @returns {string} map of interface's property schemas
 */
export declare function getVariedJSTypeProperties(type: string): Record<string, JSTypeSchema>;
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
 * Helper function to get the schemas for each property of a particular NumericJSTypeSchema.
 * @function
 * @returns {Record<string, JSTypeSchema>} map of interface's property schemas
 */
export declare function getNumericJSTypeProperties(type: string): Record<string, JSTypeSchema>;
/**
 * Acts as a wildcard for values with no typing or where the type is unknown.
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
 * Helper function to get the schemas for each property of an ArraySchema.
 * @function
 * @returns {Record<string, JSTypeSchema>} map of interface's property schemas
 */
export declare function getArraySchemaProperties(): Record<string, JSTypeSchema>;
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
 * Helper function to get the schemas for each property of a FunctionSchem.
 * @function
 * @returns {Record<string, JSTypeSchema>} map of interface's property schemas
 */
export declare function getFunctionSchemaProperties(): Record<string, JSTypeSchema>;
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
 * Helper function to get the schemas for each property of an ObjectSchema.
 * @function
 * @returns {Record<string, JSTypeSchema>} map of interface's property schemas
 */
export declare function getObjectSchemaProperties(): Record<string, JSTypeSchema>;
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
export declare enum JSONSchemaContentEncoding {
    SEVENT_BIT = "7bit",
    EIGHT_BIT = "8bit",
    BASE64 = "base64",
    BINARY = "binary",
    IETF_TOKEN = "ietf-token",
    QUOTED_PRINTABLE = "quoted-printable",
    X_TOKEN = "x-token"
}
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
 * Helper function to get the schemas for each property of a StringSchema.
 * @function
 * @returns {Record<string, JSTypeSchema>} map of interface's property schemas
 */
export declare function getStringSchemaProperties(): Record<string, JSTypeSchema>;
/**
 * Javascript type schema for symbols.
 * @interface
 */
export interface SymbolSchema extends TypedJSTypeSchema {
    type: 'symbol';
    key?: string;
}
/**
 * Helper function to get the schemas for each property of a SymbolSchema.
 * @function
 * @returns {Record<string, JSTypeSchema>} map of interface's property schemas
 */
export declare function getSymbolSchemaProperties(): Record<string, JSTypeSchema>;
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
 * Covers all javascript type schemas with a specific type (including any).
 * @type {object}
 */
export type BasicJSTypeSchema = (AnySchema | ArraySchema | BigIntSchema | BooleanSchema | FunctionSchema | NumberSchema | NullSchema | ObjectSchema | StringSchema | SymbolSchema | UndefinedSchema);
/**
 * Converts an enum to a JS type schema,
 * @function
 * @returns {JSTypeSchemaUnion} resulting schema
 */
export declare function getJSTypeSchemas(source: Record<string, any>): Record<string, ObjectSchema | JSTypeSchemaUnion>;
/**
 * Covers javascript type schemas with multiple valid sub-types.
 * @interface
 */
export interface JSTypeSchemaUnion extends AbstractJSTypeSchema {
    anyOf: JSTypeSchema[];
}
/**
 * Helper function to get the schemas for each property of a particular TypedJSTypeSchema.
 * @function
 * @returns {string} map of interface's property schemas
 */
export declare function getJSTypeSchemaUnionProperties(): Record<string, JSTypeSchema>;
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
/**
 * Converts a javascript value to it's corresponding schema,
 * @function
 * @param {any} source - value to be coverted
 * @returns {BasicJSTypeSchema} resulting schema
 */
export declare function getValueAsSchema(source: any): BasicJSTypeSchema;
/**
 * Converts an enum to a JS type schema,
 * @function
 * @param {Record<string, any>} source - enum to be converted
 * @returns {JSTypeSchemaUnion} resulting schema
 */
export declare function getEnumAsSchema(source: Record<string, any>): JSTypeSchemaUnion;
export declare const JSON_SCHEMA_TYPE_NAMES: string[];
/**
 * Tries to convert a javascript type schema to a JSON shema.
 * @function
 * @param {JSTypeSchema} source - javascript type schema to be coverted.
 * @returns {JSONSchema | undefined} resulting JSON schema, provided such a conversion is possible
 */
export declare function JSTypeToJSONSchema(source: JSTypeSchema): JSONSchema | undefined;
export type JSONSchemaObject = Exclude<JSONSchema, boolean>;
/**
 * Copies AbstractJSTypeSchema properties onto a JSON schema.
 * @function
 * @param {JSONSchemaObject} shema - JSON schema we're modifying
 * @param {JSTypeSchema} source - javascript type schema we're copying
 */
export declare function initJSONSchema(schema: JSONSchemaObject, source: JSTypeSchema): void;
/**
 * Copies VariedJSTypeSchema specific properties onto a JSON schema.
 * @function
 * @param {JSONSchemaObject} shema - JSON schema we're modifying
 * @param {JSTypeSchema} source - javascript type schema we're copying
 */
export declare function initTypedJSONSchema<T>(schema: JSONSchemaObject, source: VariedJSTypeSchema<T>): void;
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
