import {
  type JSONSchema
} from 'json-schema-typed'

export type JSONType =
  | string
  | number
  | boolean
  | null
  | { [key: string]: JSONType }
  | JSONType[]

export type JSONObject = Record<string, JSONType>

export interface TypeMarkedObject extends JSONObject {
  type: string
}

export type TypedActionRequest = TypeMarkedObject | string

export interface TypeConversionSchema {
  type: string
  actions: TypedActionRequest[]
}

export interface TypeUnionSchema {
  anyOf: TypeConversionSchema[]
}

export type TypeConversionRequest = (
  TypeConversionSchema |
  TypeUnionSchema |
  string
)

export interface TypeConversionAction<F = any, T = F> {
  transform: (
    value: F,
    options?: JSONObject,
    resolver?: TypeConversionResolver
  ) => T
  modifySchema?: (
    schema: JSONSchema,
    options?: JSONObject
  ) => void
}

export interface TypedValueConvertor<T = any> {
  matches: (value: unknown) => boolean
  convert: (value: unknown) => T
  convertWith: (
    value: unknown,
    actions: TypedActionRequest[],
    resolver?: TypeConversionResolver
  ) => T
  getAction: (key: string) => TypeConversionAction | undefined
}

export const JSON_SCHEMA_TYPE_NAMES = [
  'string',
  'number',
  'integer',
  'object',
  'array',
  'boolean',
  'null'
]

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
        for (const schema of request.anyOf) {
          const convertor = this.convertors[schema.type]
          if (convertor?.matches(value)) {
            return schema
          }
        }
        return request.anyOf[0]
      }
      return request
    }
    return {
      type: request,
      actions: []
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
        return convertor.convertWith(value, schema.actions, this)
      }
    }
  }

  getExpandedSchema (
    source: TypeConversionRequest,
    allowedTypes?: string[]
  ): JSONSchema | undefined {
    if (typeof source === 'object') {
      if ('anyOf' in source) {
        const schemas = source.anyOf.map(
          item => this.getExpandedSchema(item, allowedTypes)
        )
        return {
          anyOf: schemas.filter(item => item != null) as JSONSchema[]
        }
      }
      if (allowedTypes != null) {
        if (!allowedTypes.includes(source.type)) {
          return undefined
        }
      }
      const convertor = this.convertors[source.type]
      if (convertor != null) {
        const schema: JSONObject = {
          type: source.type
        }
        for (const request of source.actions) {
          const options = typeof request === 'object'
            ? request
            : { type: request }
          const action = convertor.getAction(options.type)
          if (action?.modifySchema != null) {
            action.modifySchema(schema, options)
          }
        }
        return schema
      }
      return undefined
    }
    return {
      type: source
    }
  }

  getJSONSchema (
    source: TypeConversionRequest
  ): JSONSchema | undefined {
    const schema = this.getExpandedSchema(source, JSON_SCHEMA_TYPE_NAMES)
    return schema != null ? schema : undefined
  }
}
