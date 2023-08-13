import { JSONSchema } from 'json-schema-typed'

export interface AbstractJSTypeSchema {
  $comment?: string
  $id?: string
  $ref?: string
  $schema?: string
  description?: string
  title?: string
  definitions?: Record<string, JSTypeSchema>
}

export interface TypedJSTypeSchema<T> extends AbstractJSTypeSchema {
  default?: T
  examples?: T[]
  const?: T
}

export interface NumericJSTypeSchema<T> extends TypedJSTypeSchema<T> {
  exclusiveMaximum?: T
  exclusiveMinimum?: T
  maximum?: T
  minimum?: T
  multipleOf?: T
}

export interface AnySchema extends AbstractJSTypeSchema {
  type: 'any'
}

export interface ArraySchema<T = any> extends TypedJSTypeSchema<T[]> {
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

export interface BooleanSchema extends TypedJSTypeSchema<boolean> {
  type: 'boolean'
}

export interface FunctionSchema extends TypedJSTypeSchema<Function> {
  type: 'function'
  parameters: JSTypeSchema[]
  returns: JSTypeSchema
}

export interface ObjectSchema extends TypedJSTypeSchema<object> {
  type: 'object'
  additionalProperties?: JSTypeSchema
  maxProperties?: number
  minProperties?: number
  patternProperties?: Record<string, JSTypeSchema>
  properties?: Record<string, JSTypeSchema>
  propertyNames?: StringSchema
  required?: string[]
}

export interface NullSchema extends AbstractJSTypeSchema {
  type: 'null'
}

export interface NumberSchema extends NumericJSTypeSchema<number> {
  type: 'number' | 'integer'
}

export type JSONSchemaContentEncoding = (
  "7bit" |
  "8bit" |
  "base64" |
  "binary" |
  "ietf-token" |
  "quoted-printable" |
  "x-token"
)

export interface StringSchema extends TypedJSTypeSchema<string> {
  type: 'string'
  contentEncoding?: JSONSchemaContentEncoding
  contentMediaType?: string
  format?: string
  maxLength?: number
  minLength?: number
  pattern?: string
}

export interface SymbolSchema extends AbstractJSTypeSchema {
  type: 'symbol'
  key: string
}

export interface UndefinedSchema extends AbstractJSTypeSchema {
  type: 'undefined'
}

export interface JSTypeSchemaUnion extends AbstractJSTypeSchema {
  anyOf: JSTypeSchema[]
}

export type JSTypeSchema = (
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
  UndefinedSchema |
  JSTypeSchemaUnion
)

export const JSON_SCHEMA_TYPE_NAMES = [
  'string',
  'number',
  'integer',
  'object',
  'array',
  'boolean',
  'null'
]

export function JSTypeToJSONSchema(source: JSTypeSchema): JSONSchema | undefined {
  let schema: JSONSchema = {}
  if('type' in source) {
    if(source.type === 'any') return true
    if(!JSON_SCHEMA_TYPE_NAMES.includes(source.type)) {
      return undefined
    }
    schema.type = source.type
  } else if ('anyOf' in source) {
    const anyOf = JSTypeArrayToJSONSchema(source.anyOf)
    if(anyOf != null) {
      schema.anyOf = anyOf
    }
  }
  if(source.$comment != null) schema.$comment = source.$comment
  if(source.$id != null) schema.$id = source.$id
  if(source.$ref != null) schema.$ref = source.$ref
  if(source.$schema != null) schema.$schema = source.$schema
  if(source.description != null) schema.description = source.description
  if(source.title != null) schema.title = source.title
  if(source.definitions != null) schema.definitions = JSTypeRecordToJSONSchema(source.definitions)
  if('default' in source) schema.default = source.default
  if('examples' in source) schema.examples = source.examples
  if('const' in source) schema.const = source.const
  if('exclusiveMaximum' in source) schema.exclusiveMaximum = Number(source.exclusiveMaximum)
  if('exclusiveMinimum' in source) schema.exclusiveMinimum = Number(source.exclusiveMinimum)
  if('maximum' in source) schema.maximum = Number(source.maximum)
  if('minimum' in source) schema.minimum = Number(source.minimum)
  if('multipleOf' in source) schema.multipleOf = Number(source.multipleOf)
  if('additionalItems' in source && source.additionalItems != null) {
    const converted = JSTypeToJSONSchema(source.additionalItems)
    if(converted != null) schema.additionalItems = converted
  }
  if('items' in source && source.items != null) {
    const converted = JSTypeToJSONSchema(source.items)
    if(converted != null) schema.contains = converted
  }
  if('prefixItems' in source && source.prefixItems != null) {
    schema.prefixItems = JSTypeArrayToJSONSchema(source.prefixItems)
  }
  if('contains' in source && source.contains != null) {
    const converted = JSTypeToJSONSchema(source.contains)
    if(converted != null) schema.contains = converted
  }
  if('maxItems' in source) schema.maxItems = source.maxItems
  if('minItems' in source) schema.minItems = source.minItems
  if('uniqueItems' in source) schema.uniqueItems = source.uniqueItems
  if('additionalProperties' in source && source.additionalProperties != null) {
    const converted = JSTypeToJSONSchema(source.additionalProperties)
    if(converted != null) schema.additionalProperties = converted
  }
  if('maxProperties' in source) schema.maxProperties = source.maxProperties
  if('minProperties' in source) schema.minProperties = source.minProperties
  if('patternProperties' in source && source.patternProperties != null) {
    schema.patternProperties = JSTypeRecordToJSONSchema(source.patternProperties)
  }
  if('properties' in source && source.properties != null) {
    schema.properties = JSTypeRecordToJSONSchema(source.properties)
  }
  if('propertyNames' in source && source.propertyNames != null) {
    schema.propertyNames = JSTypeToJSONSchema(source.propertyNames)
  }
  if('required' in source) schema.required = source.required
  if('contentEncoding' in source) schema.contentEncoding = source.contentEncoding
  if('contentMediaType' in source) schema.contentMediaType = source.contentMediaType
  if('format' in source) schema.format = source.format
  if('maxLength' in source) schema.maxLength = source.maxLength
  if('minLength' in source) schema.minLength = source.minLength
  if('pattern' in source) schema.pattern = source.pattern
  return schema
}

export function JSTypeArrayToJSONSchema(
  source: JSTypeSchema[]
): JSONSchema[] {
  const conversions = source.map(item => JSTypeToJSONSchema(item))
  const filtered = conversions.filter(item => item != null)
  return filtered as JSONSchema[]
}

export function JSTypeRecordToJSONSchema(
  source: Record<string, JSTypeSchema>
): Record<string, JSONSchema> {
  let results: Record<string, JSONSchema> = {}
  for(const key in source) {
    const sourceSchema = source[key]
    const targetSchema = JSTypeToJSONSchema(sourceSchema)
    if(targetSchema != null) {
      results[key] = targetSchema
    }
  }
  return results
}
