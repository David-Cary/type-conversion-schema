import { type JSONSchema } from 'json-schema-typed'

export interface AbstractJSTypeSchema {
  $comment?: string
  $id?: string
  $ref?: string
  $schema?: string
  description?: string
  title?: string
  definitions?: Record<string, JSTypeSchema>
}

export interface TypedJSTypeSchema extends AbstractJSTypeSchema {
  type: string
}

export interface VariedJSTypeSchema<T> extends TypedJSTypeSchema {
  default?: T
  examples?: T[]
  const?: T
}

export interface NumericJSTypeSchema<T> extends VariedJSTypeSchema<T> {
  integer?: boolean
  exclusiveMaximum?: T
  exclusiveMinimum?: T
  maximum?: T
  minimum?: T
  multipleOf?: T
}

export interface AnySchema extends VariedJSTypeSchema<any> {
  type: 'any'
}

export interface ArraySchema<T = any> extends VariedJSTypeSchema<T[]> {
  type: 'array'
  additionalItems?: JSTypeSchema
  contains?: JSTypeSchema
  items?: JSTypeSchema
  prefixItems?: JSTypeSchema[]
  maxItems?: number
  minItems?: number
  uniqueItems?: boolean
}

export interface BigIntSchema extends NumericJSTypeSchema<bigint> {
  type: 'bigint'
}

export interface BooleanSchema extends VariedJSTypeSchema<boolean> {
  type: 'boolean'
}
export type AnyFunction = () => any

export interface FunctionSchema extends VariedJSTypeSchema<AnyFunction> {
  type: 'function'
  parameters?: JSTypeSchema[]
  optionalParameters?: JSTypeSchema[]
  additionalParameters?: JSTypeSchema
  returns?: JSTypeSchema
}

export interface ObjectSchema extends VariedJSTypeSchema<object> {
  type: 'object'
  additionalProperties?: JSTypeSchema
  maxProperties?: number
  minProperties?: number
  patternProperties?: Record<string, JSTypeSchema>
  properties?: Record<string, JSTypeSchema>
  propertyNames?: StringSchema
  required?: string[]
}

export interface NullSchema extends TypedJSTypeSchema {
  type: 'null'
}

export interface NumberSchema extends NumericJSTypeSchema<number> {
  type: 'number'
}

export type JSONSchemaContentEncoding = (
  '7bit' |
  '8bit' |
  'base64' |
  'binary' |
  'ietf-token' |
  'quoted-printable' |
  'x-token'
)

export interface StringSchema extends VariedJSTypeSchema<string> {
  type: 'string'
  contentEncoding?: JSONSchemaContentEncoding
  contentMediaType?: string
  format?: string
  maxLength?: number
  minLength?: number
  pattern?: string
}

export interface SymbolSchema extends TypedJSTypeSchema {
  type: 'symbol'
  key?: string
}

export interface UndefinedSchema extends TypedJSTypeSchema {
  type: 'undefined'
}

export enum JSTypeName {
  ANY = 'any',
  ARRAY = 'array',
  BIG_INT = 'bigint',
  BOOLEAN = 'boolean',
  FUNCTION = 'function',
  NUMBER = 'number',
  NULL = 'null',
  OBJECT = 'object',
  STRING = 'string',
  SYMBOL = 'symbol',
  UNDEFINED = 'undefined'
}

export type BasicJSTypeSchema = (
  AnySchema |
  ArraySchema |
  BigIntSchema |
  BooleanSchema |
  FunctionSchema |
  NumberSchema |
  NullSchema |
  ObjectSchema |
  StringSchema |
  SymbolSchema |
  UndefinedSchema
)

export interface JSTypeSchemaUnion extends AbstractJSTypeSchema {
  anyOf: BasicJSTypeSchema[]
}

export type JSTypeSchema = BasicJSTypeSchema | JSTypeSchemaUnion

export const JSON_SCHEMA_TYPE_NAMES = [
  'string',
  'number',
  'integer',
  'object',
  'array',
  'boolean',
  'null'
]

export function JSTypeToJSONSchema (source: JSTypeSchema): JSONSchema | undefined {
  const schema: JSONSchema = {}
  if ('type' in source) {
    if (source.type === 'any') return true
    if (!JSON_SCHEMA_TYPE_NAMES.includes(source.type)) {
      return undefined
    }
    initJSONSchema(source, schema)
    schema.type = source.type
    switch (source.type) {
      case 'boolean': {
        initTypedJSONSchema(source, schema)
        break
      }
      case 'bigint':
      case 'number': {
        initTypedJSONSchema<number | bigint>(source, schema)
        schema.type = source.integer === true ? 'integer' : 'number'
        if ('exclusiveMaximum' in source) schema.exclusiveMaximum = Number(source.exclusiveMaximum)
        if ('exclusiveMinimum' in source) schema.exclusiveMinimum = Number(source.exclusiveMinimum)
        if ('maximum' in source) schema.maximum = Number(source.maximum)
        if ('minimum' in source) schema.minimum = Number(source.minimum)
        if ('multipleOf' in source) schema.multipleOf = Number(source.multipleOf)
        break
      }
      case 'string': {
        initTypedJSONSchema(source, schema)
        if ('contentEncoding' in source) schema.contentEncoding = source.contentEncoding
        if ('contentMediaType' in source) schema.contentMediaType = source.contentMediaType
        if ('format' in source) schema.format = source.format
        if ('maxLength' in source) schema.maxLength = source.maxLength
        if ('minLength' in source) schema.minLength = source.minLength
        if ('pattern' in source) schema.pattern = source.pattern
        break
      }
      case 'array': {
        initTypedJSONSchema(source, schema)
        if ('additionalItems' in source && source.additionalItems != null) {
          const converted = JSTypeToJSONSchema(source.additionalItems)
          if (converted != null) schema.additionalItems = converted
        }
        if ('items' in source && source.items != null) {
          const converted = JSTypeToJSONSchema(source.items)
          if (converted != null) schema.contains = converted
        }
        if ('prefixItems' in source && source.prefixItems != null) {
          schema.prefixItems = getTypedArray(
            source.prefixItems,
            item => JSTypeToJSONSchema(item)
          )
        }
        if ('contains' in source && source.contains != null) {
          const converted = JSTypeToJSONSchema(source.contains)
          if (converted != null) schema.contains = converted
        }
        if ('maxItems' in source) schema.maxItems = source.maxItems
        if ('minItems' in source) schema.minItems = source.minItems
        if ('uniqueItems' in source) schema.uniqueItems = source.uniqueItems
        break
      }
      case 'object': {
        initTypedJSONSchema(source, schema)
        if ('additionalProperties' in source && source.additionalProperties != null) {
          const converted = JSTypeToJSONSchema(source.additionalProperties)
          if (converted != null) schema.additionalProperties = converted
        }
        if ('maxProperties' in source) schema.maxProperties = source.maxProperties
        if ('minProperties' in source) schema.minProperties = source.minProperties
        if ('patternProperties' in source && source.patternProperties != null) {
          schema.patternProperties = getTypedValueRecord(
            source.patternProperties,
            item => JSTypeToJSONSchema(item)
          )
        }
        if ('properties' in source && source.properties != null) {
          schema.properties = getTypedValueRecord(
            source.properties,
            item => JSTypeToJSONSchema(item)
          )
        }
        if ('propertyNames' in source && source.propertyNames != null) {
          schema.propertyNames = JSTypeToJSONSchema(source.propertyNames)
        }
        if ('required' in source) schema.required = source.required
        break
      }
    }
  } else if ('anyOf' in source) {
    initJSONSchema(source, schema)
    const anyOf = getTypedArray(
      source.anyOf,
      item => JSTypeToJSONSchema(item)
    )
    if (anyOf != null) {
      schema.anyOf = anyOf
    }
  }
  return schema
}

export type JSONSchemaObject = Exclude<JSONSchema, boolean>

export function initJSONSchema (
  source: JSTypeSchema,
  schema: JSONSchemaObject
): void {
  if (source.$comment != null) schema.$comment = source.$comment
  if (source.$id != null) schema.$id = source.$id
  if (source.$ref != null) schema.$ref = source.$ref
  if (source.$schema != null) schema.$schema = source.$schema
  if (source.description != null) schema.description = source.description
  if (source.title != null) schema.title = source.title
  if (source.definitions != null) {
    schema.definitions = getTypedValueRecord(
      source.definitions,
      item => JSTypeToJSONSchema(item)
    )
  }
}

export function initTypedJSONSchema<T> (
  source: VariedJSTypeSchema<T>,
  schema: JSONSchemaObject
): void {
  if ('default' in source) schema.default = source.default
  if ('examples' in source) schema.examples = source.examples
  if ('const' in source) schema.const = source.const
}

export function getTypedArray<F, T=F> (
  source: F[],
  convert: (value: F) => T | undefined
): T[] {
  const results: T[] = []
  for (const item of source) {
    const converted = convert(item)
    if (converted != null) {
      results.push(converted)
    }
  }
  return results
}

export function getTypedValueRecord<F, T=F> (
  source: Record<string, F>,
  convert: (value: F) => T | undefined
): Record<string, T> {
  const results: Record<string, T> = {}
  for (const key in source) {
    const value = source[key]
    const converted = convert(value)
    if (converted != null) {
      results[key] = converted
    }
  }
  return results
}

export function getExtendedTypeOf (value: any): JSTypeName {
  if (value === null) return JSTypeName.NULL
  if (Array.isArray(value)) return JSTypeName.ARRAY
  return typeof value as JSTypeName
}

export function createBasicSchema (type: JSTypeName): BasicJSTypeSchema {
  const schema = { type }
  return schema as BasicJSTypeSchema
}

export function stringToJSTypeName (source: string): JSTypeName {
  for (const key in JSTypeName) {
    const value = (JSTypeName as Record<string, JSTypeName>)[key]
    if (value === source) return value
  }
  return JSTypeName.ANY
}
