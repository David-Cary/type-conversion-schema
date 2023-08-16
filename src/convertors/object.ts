import {
  type TypeConversionAction,
  type TypeConversionRequest,
  type TypeConversionResolver
} from '../schema/conversions'
import { type JSONObject } from '../schema/JSON'
import {
  TypedActionsValueConvertor,
  type TypedActionMap,
  DEFAULT_UNTYPED_CONVERSIONS
} from './actions'
import {
  type BasicJSTypeSchema,
  JSTypeName,
  getExtendedTypeOf,
  createBasicSchema
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

export class WrapInObjectAction implements TypeConversionAction<any, POJObject> {
  transform (
    value: any,
    options?: JSONObject
  ): POJObject {
    if (typeof options?.key === 'string' && options.key.length > 0) {
      const wrapper: POJObject = {}
      wrapper[options.key] = value
      return wrapper
    }
    return getObjectFrom(value)
  }

  createSchema (): BasicJSTypeSchema {
    return { type: 'object' }
  }

  modifySchema (
    schema: BasicJSTypeSchema,
    options?: JSONObject
  ): BasicJSTypeSchema {
    const properties: Record<string, BasicJSTypeSchema> = {}
    if (typeof options?.key === 'string' && options.key.length > 0) {
      properties[options.key] = schema
    }
    return {
      type: 'object',
      properties
    }
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

export class AssignObjectValuesAction implements TypeConversionAction<POJObject> {
  transform (
    value: POJObject,
    options?: JSONObject
  ): POJObject {
    if (typeof options?.values === 'object' && options.values != null) {
      Object.assign(value, options.value)
    }
    return value
  }

  modifySchema (
    schema: BasicJSTypeSchema,
    options?: JSONObject
  ): BasicJSTypeSchema {
    if (schema.type === 'object' && options != null) {
      if (schema.properties == null) {
        schema.properties = {}
      }
      for (const key in options) {
        const type = getExtendedTypeOf(options[key])
        schema.properties[key] = createBasicSchema(type)
      }
    }
    return schema
  }
}

export class AssignObjectDefaultsAction implements TypeConversionAction<POJObject> {
  transform (
    value: POJObject,
    options?: JSONObject
  ): POJObject {
    if (typeof options?.values === 'object' && options.values != null) {
      const map = options.values as POJObject
      for (const key in map) {
        if (value[key] === undefined) {
          value[key] = map[key]
        }
      }
    }
    return value
  }

  modifySchema (
    schema: BasicJSTypeSchema,
    options?: JSONObject
  ): BasicJSTypeSchema {
    if (schema.type === 'object' && options != null) {
      if (schema.properties == null) {
        schema.properties = {}
      }
      for (const key in options) {
        if (key in schema.properties) continue
        const type = getExtendedTypeOf(options[key])
        schema.properties[key] = createBasicSchema(type)
      }
    }
    return schema
  }
}

export class DeleteObjectValueAction implements TypeConversionAction<POJObject> {
  transform (
    value: POJObject,
    options?: JSONObject
  ): POJObject {
    if (typeof options?.key === 'string') {
      /* eslint-disable @typescript-eslint/no-dynamic-delete */
      delete value[options.key]
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
    return schema
  }
}

export class SetObjectPropertyAction implements TypeConversionAction<POJObject> {
  transform (
    value: POJObject,
    options?: JSONObject,
    resolver?: TypeConversionResolver
  ): POJObject {
    if (typeof options?.key === 'string') {
      let propertyValue: unknown = options.value
      if (resolver != null) {
        const castAs = this.getConversionRequestFrom(options.as)
        if (castAs != null) {
          propertyValue = resolver.convert(propertyValue, castAs)
        }
      }
      value[options.key] = propertyValue
    }
    return value
  }

  modifySchema (
    schema: BasicJSTypeSchema,
    options?: JSONObject,
    resolver?: TypeConversionResolver
  ): BasicJSTypeSchema {
    if (schema.type === 'object' && typeof options?.key === 'string') {
      if (schema.properties == null) {
        schema.properties = {}
      }
      const key = options.key
      const castAs = this.getConversionRequestFrom(options.as)
      if (castAs != null) {
        if (resolver != null) {
          const subschema = resolver.createJSTypeSchema(castAs)
          schema.properties[key] = (subschema != null)
            ? subschema
            : createBasicSchema(JSTypeName.ANY)
        } else {
          let castType = 'any'
          if (typeof castAs === 'object') {
            if ('type' in castAs) {
              castType = castAs.type
            }
          } else {
            castType = castAs
          }
          const type = (castType in Object.values(JSTypeName))
            ? castType as JSTypeName
            : JSTypeName.ANY
          schema.properties[key] = createBasicSchema(type)
        }
      } else {
        const type = getExtendedTypeOf(options.value)
        schema.properties[key] = createBasicSchema(type)
      }
    }
    return schema
  }

  getConversionRequestFrom (source: unknown): TypeConversionRequest | undefined {
    if (typeof source === 'string') return source
    if (
      typeof source === 'object' &&
      source != null &&
      ('type' in source || 'anyOf' in source)
    ) {
      return source as TypeConversionRequest
    }
  }
}

export const DEFAULT_OBJECT_ACTIONS: TypedActionMap<POJObject> = {
  untyped: { ...DEFAULT_UNTYPED_CONVERSIONS },
  conversion: {
    wrap: new WrapInObjectAction()
  },
  typed: {
    assign: new AssignObjectValuesAction(),
    clone: new CloneViaSpreadAction(),
    defaults: new AssignObjectDefaultsAction(),
    delete: new DeleteObjectValueAction(),
    set: new SetObjectPropertyAction()
  }
}

export class ToObjectConvertor extends TypedActionsValueConvertor<POJObject> {
  constructor (
    actions: TypedActionMap<POJObject> = DEFAULT_OBJECT_ACTIONS
  ) {
    super('object', getObjectFrom, actions)
  }
}
