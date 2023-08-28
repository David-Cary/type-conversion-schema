import {
  type JSTypeSchema,
  type AbstractJSTypeSchema,
  type BasicJSTypeSchema,
  type JSTypeSchemaUnion,
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

export type TypeConversionSchema = BasicJSTypeSchema & TypeConversionCallbacks

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
  createJSTypeSchema: (
    source?: Partial<TypeConversionSchema>,
    resolver?: TypeConversionResolver
  ) => BasicJSTypeSchema
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

  createJSTypeSchema (source: TypeConversionRequest): JSTypeSchema | undefined {
    if (typeof source === 'object') {
      if ('anyOf' in source) {
        const union: JSTypeSchemaUnion = {
          anyOf: []
        }
        for (const item of source.anyOf) {
          const subschema = this.createJSTypeSchema(item)
          if (subschema != null && 'type' in subschema) {
            union.anyOf.push(subschema)
          }
        }
        return union
      }
      const sourceSchema = typeof source === 'object' ? source : { type: source }
      if (sourceSchema != null) {
        const convertor = this.convertors[sourceSchema.type]
        if (convertor != null) {
          return convertor.createJSTypeSchema(sourceSchema, this)
        }
      }
    } else {
      return this.createJSTypeSchema({ type: source })
    }
  }
}
