import {
  type JSTypeSchema,
  type AbstractJSTypeSchema,
  type BasicJSTypeSchema,
  type AnySchema,
  type ArraySchema,
  type BigIntSchema,
  type BooleanSchema,
  type FunctionSchema,
  type NumberSchema,
  type NullSchema,
  type ObjectSchema,
  type StringSchema,
  type SymbolSchema,
  type UndefinedSchema,
  type JSTypeName
} from './JSType'
import { type JSONObject } from './JSON'

export interface TypeMarkedObject extends JSONObject {
  type: string
}

export type TypedActionRequest = TypeMarkedObject | string

export interface TypeConversionCallbacks {
  prepare?: TypedActionRequest[]
  convertVia?: TypedActionRequest
  finalize?: TypedActionRequest[]
}

export type BasicTypeConversionSchema = BasicJSTypeSchema & TypeConversionCallbacks

export interface ArrayCreationSchema extends
  Omit<ArraySchema, 'additionalItems' | 'contains' | 'items' | 'prefixItems'>,
  TypeConversionCallbacks {
  additionalItems?: TypeConversionRequest
  contains?: TypeConversionRequest
  items?: TypeConversionRequest
  prefixItems?: TypeConversionRequest[]
}

export interface FunctionCreationSchema extends
  Omit<FunctionSchema, 'parameters' | 'optionalParameters' | 'additionalParameters' | 'returns'>,
  TypeConversionCallbacks {
  parameters?: TypeConversionRequest[]
  optionalParameters?: TypeConversionRequest[]
  additionalParameters?: TypeConversionRequest
  returns?: TypeConversionRequest
}

export interface ObjectCreationSchema extends
  Omit<ObjectSchema, 'additionalProperties' | 'patternProperties' | 'properties'>,
  TypeConversionCallbacks {
  additionalProperties?: TypeConversionRequest
  patternProperties?: Record<string, TypeConversionRequest>
  properties?: Record<string, TypeConversionRequest>
}

export type TypeConversionSchema = (
  (
    (
      AnySchema |
      BigIntSchema |
      BooleanSchema |
      NumberSchema |
      NullSchema |
      StringSchema |
      SymbolSchema |
      UndefinedSchema
    ) & TypeConversionCallbacks
  ) |
  ArrayCreationSchema |
  FunctionCreationSchema |
  ObjectCreationSchema
)

export interface TypeConversionSchemaUnion extends AbstractJSTypeSchema {
  anyOf: Array<TypeConversionSchema | JSTypeName>
}

export type TypeConversionRequest = (
  TypeConversionSchema |
  TypeConversionSchemaUnion |
  JSTypeName
)

export function parseTypeConversionRequest (
  request: TypeConversionRequest
): TypeConversionSchema | TypeConversionSchemaUnion {
  if (typeof request === 'string') {
    return { type: request }
  }
  return request
}

export function removeTypeConversionActionsFrom (
  schema: TypeConversionSchema
): void {
  if ('prepare' in schema) {
    delete schema.prepare
  }
  if ('convertVia' in schema) {
    delete schema.convertVia
  }
  if ('finalize' in schema) {
    delete schema.finalize
  }
}

export function typeConversionToJSTypeSchema (
  request: TypeConversionRequest
): JSTypeSchema {
  if (typeof request === 'string') {
    return { type: request }
  }
  const schema: Record<string, any> = { ...request }
  if ('type' in request) {
    removeTypeConversionActionsFrom(schema as TypeConversionSchema)
    switch (request.type) {
      case 'array': {
        if (request.additionalItems != null) {
          schema.additionalItems = typeConversionToJSTypeSchema(request.additionalItems)
        }
        if (request.contains != null) {
          schema.contains = typeConversionToJSTypeSchema(request.contains)
        }
        if (request.items != null) {
          schema.items = typeConversionToJSTypeSchema(request.items)
        }
        if (request.prefixItems != null) {
          schema.prefixItems = request.prefixItems.map(
            item => typeConversionToJSTypeSchema(item)
          )
        }
        break
      }
      case 'function': {
        if (request.parameters != null) {
          schema.parameters = request.parameters.map(
            item => typeConversionToJSTypeSchema(item)
          )
        }
        if (request.optionalParameters != null) {
          schema.optionalParameters = request.optionalParameters.map(
            item => typeConversionToJSTypeSchema(item)
          )
        }
        if (request.additionalParameters != null) {
          schema.additionalParameters = typeConversionToJSTypeSchema(request.additionalParameters)
        }
        if (request.returns != null) {
          schema.returns = typeConversionToJSTypeSchema(request.returns)
        }
        break
      }
      case 'object': {
        if (request.additionalProperties != null) {
          schema.additionalProperties = typeConversionToJSTypeSchema(request.additionalProperties)
        }
        if (request.patternProperties != null) {
          schema.patternProperties = convertRecordValues(
            request.patternProperties,
            typeConversionToJSTypeSchema
          )
        }
        if (request.properties != null) {
          schema.properties = convertRecordValues(
            request.properties,
            typeConversionToJSTypeSchema
          )
        }
        break
      }
    }
  } else {
    schema.anyOf = request.anyOf.map(
      option => typeConversionToJSTypeSchema(option)
    )
  }
  return schema as JSTypeSchema
}

export function convertRecordValues<F, T> (
  source: Record<string, F>,
  convert: (value: F) => T
): Record<string, T> {
  const results: Record<string, T> = {}
  for (const key in source) {
    results[key] = convert(source[key])
  }
  return results
}

export interface TypeConversionAction<F = any, T = F> {
  transform: (
    value: F,
    options?: JSONObject,
    resolver?: TypeConversionResolver
  ) => T
  expandSchema?: (
    schema: Partial<TypeConversionSchema>,
    options?: JSONObject,
    resolver?: TypeConversionResolver
  ) => void
}

export interface TypedValueConvertor<T = any> {
  matches: (value: unknown) => boolean
  convert: (value: unknown) => T
  convertWith: (
    value: unknown,
    schema: Partial<TypeConversionSchema>,
    resolver?: TypeConversionResolver
  ) => T
  expandSchema?: (
    schema: Partial<TypeConversionSchema>,
    resolver?: TypeConversionResolver
  ) => void
}

export class TypeConversionResolver {
  readonly convertors: Record<string, TypedValueConvertor>

  constructor (convertors: Record<string, TypedValueConvertor> = {}) {
    this.convertors = convertors
  }

  getRequestSchema (
    request: TypeConversionRequest,
    value?: unknown
  ): TypeConversionSchema | undefined {
    if (typeof request === 'object') {
      if ('anyOf' in request) {
        for (const item of request.anyOf) {
          const schema = typeof item === 'object' ? item : { type: item }
          const convertor = this.convertors[schema.type]
          if (convertor?.matches(value)) {
            return schema
          }
        }
        const firstItem = request.anyOf[0]
        if (firstItem != null) {
          return typeof firstItem === 'object' ? firstItem : { type: firstItem }
        }
        return undefined
      }
      return request
    }
    return {
      type: request
    }
  }

  convert (
    value: unknown,
    castAs: TypeConversionRequest
  ): unknown {
    const schema = this.getRequestSchema(castAs, value)
    if (schema != null) {
      const convertor = this.convertors[schema.type]
      if (convertor != null) {
        return convertor.convertWith(value, schema, this)
      }
    }
  }

  getExpandedSchema (
    source: TypeConversionRequest
  ): TypeConversionSchema | TypeConversionSchemaUnion {
    if (typeof source === 'string') {
      return { type: source }
    }
    if ('anyOf' in source) {
      const union: TypeConversionSchemaUnion = { ...source }
      union.anyOf = union.anyOf.map(
        item => this.getExpandedSchema(item) as TypeConversionSchema
      )
      return union
    }
    const schema = { ...source }
    const convertor = this.convertors[schema.type]
    if (convertor?.expandSchema != null) {
      convertor.expandSchema(schema, this)
    }
    return schema
  }
}
