import {
  type TypeConversionAction,
  type TypeConversionRequest,
  type TypeConversionResolver
} from '../schema/conversions'
import { type JSONObject } from '../schema/JSON'
import {
  TypedActionsValueConvertor,
  type TypedActionMap,
  getNestedValue,
  DEFAULT_UNTYPED_CONVERSIONS
} from './actions'
import { cloneJSON } from '../schema/JSON'
import {
  type BasicJSTypeSchema,
  type JSTypeSchema,
  type ObjectSchema,
  type ArraySchema,
  JSTypeName,
  getExtendedTypeOf,
  stringToJSTypeName
} from '../schema/JSType'

export type POJObject = Record<string, unknown>

export function getObjectFrom (source: unknown): POJObject {
  switch (typeof source) {
    case 'object': {
      if (Array.isArray(source)) {
        const map: POJObject = {}
        for (let i = 0; i < source.length; i++) {
          map[String(i)] = source[i]
        }
        return map
      }
      if (source != null) return source as POJObject
      break
    }
    case 'string': {
      try {
        return JSON.parse(source)
      } catch (error) {
        return {}
      }
    }
  }
  return {}
}

export function getConversionRequestFrom (source: any): TypeConversionRequest | undefined {
  if (typeof source === 'string') return stringToJSTypeName(source)
  if (
    typeof source === 'object' &&
    source != null &&
    ('type' in source || 'anyOf' in source)
  ) {
    return source as TypeConversionRequest
  }
}

export interface PropertyConversionSchema {
  from?: Array<string | number>
  as?: TypeConversionRequest
  default?: any
}

export function getPropertyConversionFrom (source: any): PropertyConversionSchema {
  const schema: PropertyConversionSchema = {}
  if (typeof source === 'object' && source != null) {
    if ('from' in source && Array.isArray(source.from)) {
      schema.from = source.from.filter(
        (value: unknown) => typeof value === 'string' || typeof value === 'number'
      )
    }
    if ('as' in source) {
      schema.as = getConversionRequestFrom(source.as)
    }
    if ('default' in source) {
      schema.default = source.default
    }
  }
  return schema
}

export function resolvePropertyConversion (
  source: any,
  key: string,
  schema: PropertyConversionSchema,
  resolver?: TypeConversionResolver
): any {
  let value = schema.from != null
    ? getNestedValue(source, schema.from)
    : getNestedValue(source, key)
  if (value === undefined && schema.default !== undefined) {
    value = cloneJSON(schema.default)
  }
  if (schema.as != null && resolver != null) {
    return resolver.convert(value, schema.as)
  }
  return value
}

export class ModifyObjectPropertiesAction implements TypeConversionAction<POJObject> {
  transform (
    value: POJObject,
    options?: JSONObject,
    resolver?: TypeConversionResolver
  ): POJObject {
    if (options != null) {
      this.initializeObjectProperties(value, options, value, resolver)
    }
    return value
  }

  modifySchema (
    schema: BasicJSTypeSchema,
    options?: JSONObject,
    resolver?: TypeConversionResolver
  ): BasicJSTypeSchema {
    if (schema.type === 'object' && options != null) {
      this.initializeObjectSchema(schema, options, resolver)
    }
    return schema
  }

  initializeObjectProperties (
    target: POJObject,
    options: JSONObject,
    source: POJObject = target,
    resolver?: TypeConversionResolver
  ): void {
    const properties = this.getPropertyConversionMap(options.properties)
    for (const key in properties) {
      target[key] = resolvePropertyConversion(
        source,
        key,
        properties[key],
        resolver
      )
    }
    if (options.additionalProperties != null) {
      const patternProperties = this.getPropertyConversionMap(options.patternProperties)
      const additionalProperties = getPropertyConversionFrom(options.additionalProperties)
      const pick = Array.isArray(options.pick)
        ? options.pick.filter((value: unknown) => typeof value === 'string')
        : null
      const omit = Array.isArray(options.omit)
        ? options.omit.filter((value: unknown) => typeof value === 'string')
        : []
      for (const key in source) {
        if (pick != null) {
          if (!pick.includes(key)) continue
        } else if (omit.includes(key)) continue
        if (key in target) continue
        let patternMatched = false
        for (const pattern in patternProperties) {
          const exp = new RegExp(pattern)
          patternMatched = exp.test(key)
          if (patternMatched) {
            target[key] = resolvePropertyConversion(
              source,
              key,
              patternProperties[pattern],
              resolver
            )
            break
          }
        }
        if (patternMatched) continue
        target[key] = resolvePropertyConversion(
          source,
          key,
          additionalProperties,
          resolver
        )
      }
    }
  }

  initializeObjectSchema (
    schema: ObjectSchema,
    options: JSONObject,
    resolver?: TypeConversionResolver
  ): void {
    if (options.properties != null) {
      schema.properties = {}
      const properties = this.getPropertyConversionMap(options.properties)
      for (const key in properties) {
        const conversion = properties[key]
        schema.properties[key] = this.getPropertySchema(conversion.as, resolver)
      }
    }
    if (options.patternProperties != null) {
      schema.patternProperties = {}
      const properties = this.getPropertyConversionMap(options.patternProperties)
      for (const key in properties) {
        const conversion = properties[key]
        schema.patternProperties[key] = this.getPropertySchema(conversion.as, resolver)
      }
    }
    if (
      options.additionalProperties != null &&
      typeof options.additionalProperties === 'object' &&
      'as' in options.additionalProperties
    ) {
      schema.additionalProperties = this.getPropertySchema(
        options.additionalProperties.as,
        resolver
      )
    }
  }

  getPropertyConversionMap (source: any): Record<string, PropertyConversionSchema> {
    const map: Record<string, PropertyConversionSchema> = {}
    if (typeof source === 'object' && source != null) {
      if (Array.isArray(source)) {
        for (let i = 0; i < source.length; i++) {
          const key = String(i)
          map[key] = getPropertyConversionFrom(source[i])
        }
      } else {
        for (const key in source) {
          map[key] = getPropertyConversionFrom(source[key])
        }
      }
    }
    return map
  }

  getPropertySchema (
    source: any,
    resolver?: TypeConversionResolver
  ): JSTypeSchema {
    if (resolver != null) {
      const request = getConversionRequestFrom(source)
      if (request != null) {
        const schema = resolver.createJSTypeSchema(request)
        if (schema != null) {
          return schema
        }
      }
    }
    return { type: 'any' }
  }
}

export class CreateSpecifiedObjectAction
  extends ModifyObjectPropertiesAction
  implements TypeConversionAction<any, POJObject> {
  transform (
    value: any,
    options?: JSONObject,
    resolver?: TypeConversionResolver
  ): POJObject {
    const result: POJObject = {}
    if (options != null) {
      this.initializeObjectProperties(result, options, value, resolver)
    }
    return result
  }

  createSchema (
    options?: JSONObject,
    resolver?: TypeConversionResolver
  ): BasicJSTypeSchema {
    const schema: ObjectSchema = { type: 'object' }
    if (options != null) {
      this.initializeObjectSchema(schema, options, resolver)
    }
    return schema
  }
}

export class CloneViaSpreadAction implements TypeConversionAction<POJObject> {
  transform (
    value: POJObject,
    options?: JSONObject
  ): POJObject {
    return { ...value }
  }
}

export class DeleteNestedValueAction<T = any> implements TypeConversionAction<T> {
  transform (
    value: T,
    options?: JSONObject
  ): T {
    if (options != null && 'path' in options) {
      const path = Array.isArray(options.path) ? options.path : [options.path]
      if (path.length > 0) {
        const parentPath = path.slice(0, -1)
        const collection = getNestedValue(value, parentPath)
        if (typeof collection === 'object' && collection != null) {
          const finalStep = path[path.length - 1]
          if (Array.isArray(collection)) {
            const index = Number(finalStep)
            if (!isNaN(index)) {
              collection.splice(index, 1)
            }
          } else {
            const key = String(finalStep)
            /* eslint-disable @typescript-eslint/no-dynamic-delete */
            delete collection[key]
          }
        }
      }
    }
    return value
  }

  modifySchema (
    schema: BasicJSTypeSchema,
    options?: JSONObject
  ): BasicJSTypeSchema {
    if (schema.type === 'object' && typeof options?.key === 'string') {
      if (schema.properties != null) {
        if (options.key in schema.properties) {
          /* eslint-disable @typescript-eslint/no-dynamic-delete */
          delete schema.properties[options.key]
        }
      }
    }
    if (options != null && 'path' in options) {
      const path = Array.isArray(options.path) ? options.path : [options.path]
      if (path.length > 0) {
        const maxIndex = path.length - 1
        if (maxIndex >= 0) {
          let targetSchema: JSTypeSchema | undefined = schema
          for (let i = 0; i < maxIndex; i++) {
            if (targetSchema == null) break
            const step = path[i]
            targetSchema = this.getSubSchema(targetSchema, step)
          }
          if (targetSchema != null && 'type' in targetSchema) {
            const finalKey = path[maxIndex]
            switch (targetSchema.type) {
              case JSTypeName.OBJECT: {
                const objectSchema = targetSchema
                if (objectSchema.properties != null) {
                  const stringKey = String(finalKey)
                  /* eslint-disable @typescript-eslint/no-dynamic-delete */
                  delete objectSchema.properties[stringKey]
                }
                break
              }
              case JSTypeName.ARRAY: {
                const arraySchema = targetSchema as ArraySchema
                if (arraySchema.prefixItems != null) {
                  const index = Number(finalKey)
                  if (!isNaN(index)) {
                    arraySchema.prefixItems.splice(index, 1)
                  }
                }
                break
              }
            }
          }
        }
      }
    }
    return schema
  }

  getSubSchema (
    source: JSTypeSchema,
    key: any
  ): JSTypeSchema | undefined {
    if ('type' in source) {
      switch (source.type) {
        case JSTypeName.OBJECT: {
          const stringKey = String(key)
          return (source.properties != null) ? source.properties[stringKey] : undefined
        }
        case JSTypeName.ARRAY: {
          const index = Number(key)
          if (isNaN(index)) return undefined
          return (source.prefixItems != null) ? source.prefixItems[index] : undefined
        }
      }
    }
  }
}

export class SetNestedValueAction<T = any> extends DeleteNestedValueAction<T> {
  transform (
    value: T,
    options?: JSONObject,
    resolver?: TypeConversionResolver
  ): T {
    if (options != null && 'path' in options) {
      const path = Array.isArray(options.path) ? options.path : [options.path]
      if (path.length > 0) {
        const parentPath = path.slice(0, -1)
        const collection = getNestedValue(value, parentPath)
        if (typeof collection === 'object' && collection != null) {
          const finalStep = path[path.length - 1]
          let targetValue = ('value' in options)
            ? options.value
            : (
                ('from' in options)
                  ? getNestedValue(value, options.from)
                  : getNestedValue(collection, finalStep)
              )
          if (resolver != null) {
            const castAs = getConversionRequestFrom(options.as)
            if (castAs != null) {
              targetValue = resolver.convert(targetValue, castAs)
            }
          }
          if (Array.isArray(collection)) {
            const index = Number(finalStep)
            if (!isNaN(index)) {
              collection[index] = targetValue
            }
          } else {
            const key = String(finalStep)
            collection[key] = targetValue
          }
        }
      }
    }
    return value
  }

  modifySchema (
    schema: BasicJSTypeSchema,
    options?: JSONObject,
    resolver?: TypeConversionResolver
  ): BasicJSTypeSchema {
    if (options != null && 'path' in options) {
      let targetSchema: JSTypeSchema = schema
      const path = Array.isArray(options.path) ? options.path : [options.path]
      const maxIndex = path.length - 1
      if (maxIndex >= 0) {
        for (let i = 0; i < maxIndex; i++) {
          const step = path[i]
          let nextSchema = this.getSubSchema(targetSchema, step)
          if (nextSchema != null) {
            targetSchema = nextSchema
          } else {
            nextSchema = this.createSubSchema(path[i + 1])
            if (nextSchema != null) {
              this.setSubSchema(targetSchema, step, nextSchema)
              targetSchema = nextSchema
            } else {
              return schema
            }
          }
        }
        const finalStep = path[maxIndex]
        const valueSchema = this.createValueSchema(options, resolver)
        this.setSubSchema(targetSchema, finalStep, valueSchema)
      }
    }
    return schema
  }

  setSubSchema (
    target: JSTypeSchema,
    key: any,
    value: JSTypeSchema
  ): void {
    if ('type' in target) {
      switch (target.type) {
        case JSTypeName.OBJECT: {
          const stringKey = String(key)
          if (target.properties == null) {
            target.properties = {}
          }
          target.properties[stringKey] = value
          return
        }
        case JSTypeName.ARRAY: {
          const index = Number(key)
          if (isNaN(index)) return
          if (target.prefixItems == null) {
            target.prefixItems = []
          }
          target.prefixItems[index] = value
        }
      }
    }
  }

  createSubSchema (key: any): BasicJSTypeSchema | undefined {
    switch (typeof key) {
      case 'string': {
        return { type: 'object' }
      }
      case 'number': {
        return { type: 'array' }
      }
    }
  }

  createValueSchema (
    options: JSONObject,
    resolver?: TypeConversionResolver
  ): JSTypeSchema {
    if (resolver != null) {
      const castAs = getConversionRequestFrom(options.as)
      if (castAs != null) {
        const resolved = resolver.createJSTypeSchema(castAs)
        if (resolved != null) {
          return resolved
        }
      }
    }
    if ('value' in options) {
      const type = getExtendedTypeOf(options.value)
      const schema = { type }
      return schema as BasicJSTypeSchema
    }
    const schema = { type: JSTypeName.ANY }
    return schema as BasicJSTypeSchema
  }
}

export const DEFAULT_OBJECT_ACTIONS: TypedActionMap<POJObject> = {
  untyped: { ...DEFAULT_UNTYPED_CONVERSIONS },
  conversion: {
    create: new CreateSpecifiedObjectAction()
  },
  typed: {
    clone: new CloneViaSpreadAction(),
    delete: new DeleteNestedValueAction<POJObject>(),
    modify: new ModifyObjectPropertiesAction(),
    set: new SetNestedValueAction<POJObject>()
  }
}

export class ToObjectConvertor extends TypedActionsValueConvertor<POJObject> {
  constructor (
    actions: TypedActionMap<POJObject> = DEFAULT_OBJECT_ACTIONS
  ) {
    super('object', getObjectFrom, actions)
  }
}
