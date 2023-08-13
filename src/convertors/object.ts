import { type TypeConversionAction } from '../schema/conversions'
import { type JSONObject } from '../schema/JSON'
import {
  TypedActionsValueConvertor,
  type TypedActionMap,
  DefaultValueAction,
  DEFAULT_UNTYPED_CONVERSIONS
} from './actions'
import { type JSONSchema } from 'json-schema-typed'

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

  replaceSchema (
    schema: JSONSchema,
    options?: JSONObject
  ): JSONSchema {
    const properties: Record<string, JSONSchema> = {}
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
}

export class DeleteObjectValuesAction implements TypeConversionAction<POJObject> {
  transform (
    value: POJObject,
    options?: JSONObject
  ): POJObject {
    const keys = options != null && Array.isArray(options.keys)
      ? options.keys
      : []
    for (const key of keys) {
      const stringKey = String(key)
      if (stringKey in value) {
        /* eslint-disable @typescript-eslint/no-dynamic-delete */
        delete value[stringKey]
      }
    }
    return value
  }
}

export const DEFAULT_OBJECT_ACTIONS: TypedActionMap<POJObject> = {
  untyped: Object.assign(
    {
      default: new DefaultValueAction(),
      wrap: new WrapInObjectAction()
    },
    DEFAULT_UNTYPED_CONVERSIONS
  ),
  typed: {
    assign: new AssignObjectValuesAction(),
    clone: new CloneViaSpreadAction(),
    defaults: new AssignObjectDefaultsAction(),
    delete: new DeleteObjectValuesAction()
  }
}

export class ToObjectConvertor extends TypedActionsValueConvertor<POJObject> {
  constructor (
    actions: TypedActionMap<POJObject> = DEFAULT_OBJECT_ACTIONS
  ) {
    super('object', getObjectFrom, actions)
  }
}
