import {
  type TypeConversionAction,
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
  type ArraySchema
} from '../schema/JSType'
import {
  type PropertyConversionSchema,
  DeleteNestedValueAction,
  SetNestedValueAction,
  getPropertyConversionFrom,
  getConversionRequestFrom
} from './object'

export function getArrayFrom (source: unknown): any[] {
  if (Array.isArray(source)) {
    return source
  }
  return source !== undefined ? [source] : []
}

export function resolveIndexedConversion (
  source: any,
  index: number,
  schema: PropertyConversionSchema,
  resolver?: TypeConversionResolver
): any {
  let value = schema.from != null
    ? getNestedValue(source, schema.from)
    : getNestedValue(source, index)
  if (value === undefined && schema.default !== undefined) {
    value = cloneJSON(schema.default)
  }
  if (schema.as != null && resolver != null) {
    return resolver.convert(value, schema.as)
  }
  return value
}

export class ModifyArrayAction implements TypeConversionAction<any[]> {
  transform (
    value: any[],
    options?: JSONObject,
    resolver?: TypeConversionResolver
  ): any[] {
    if (options != null) {
      this.initializeArray(value, options, value, resolver)
    }
    return value
  }

  modifySchema (
    schema: BasicJSTypeSchema,
    options?: JSONObject,
    resolver?: TypeConversionResolver
  ): BasicJSTypeSchema {
    if (schema.type === 'array' && options != null) {
      this.initializeArraySchema(schema, options, resolver)
    }
    return schema
  }

  initializeArray (
    target: any[],
    options: JSONObject,
    source: any[] = target,
    resolver?: TypeConversionResolver
  ): void {
    const prefixItems = this.getPropertyConversions(options.prefixItems)
    for (let i = 0; i < prefixItems.length; i++) {
      target[i] = resolveIndexedConversion(
        source,
        i,
        prefixItems[i],
        resolver
      )
    }
    if (options.items != null) {
      const itemSchema = getPropertyConversionFrom(options.items)
      const uniqueItems = Boolean(options.uniqueItems)
      const prefixCount = prefixItems.length
      for (let i = source.length - 1; i >= prefixCount; i--) {
        const value = resolveIndexedConversion(
          source,
          i,
          itemSchema,
          resolver
        )
        if (uniqueItems && target.includes(value)) {
          target.splice(i, 1)
          continue
        }
        target[i] = value
      }
    }
  }

  initializeArraySchema (
    schema: ArraySchema,
    options: JSONObject,
    resolver?: TypeConversionResolver
  ): void {
    if (options.prefixItems != null) {
      const prefixItems = this.getPropertyConversions(options.properties)
      schema.prefixItems = prefixItems.map(item => this.getItemSchema(item))
    }
    if (
      options.items != null &&
      typeof options.items === 'object' &&
      'as' in options.items
    ) {
      schema.items = this.getItemSchema(
        options.items.as,
        resolver
      )
    }
    if ('uniqueItems' in options) {
      schema.uniqueItems = Boolean(options.uniqueItems)
    }
  }

  getPropertyConversions (source: any): PropertyConversionSchema[] {
    if (typeof source === 'object' && source != null) {
      if (Array.isArray(source)) {
        return source.map(item => getPropertyConversionFrom(item))
      } else {
        const conversions: PropertyConversionSchema[] = []
        for (const key in source) {
          const conversion = getPropertyConversionFrom(source[key])
          conversions.push(conversion)
        }
        return conversions
      }
    }
    return []
  }

  getItemSchema (
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

export class CreateSpecifiedArrayAction
  extends ModifyArrayAction
  implements TypeConversionAction<any, any[]> {
  transform (
    value: any,
    options?: JSONObject,
    resolver?: TypeConversionResolver
  ): any[] {
    const result: any[] = []
    if (options != null) {
      this.initializeArray(result, options, value, resolver)
    }
    return result
  }

  createSchema (
    options?: JSONObject,
    resolver?: TypeConversionResolver
  ): BasicJSTypeSchema {
    const schema: ArraySchema = { type: 'array' }
    if (options != null) {
      this.initializeArraySchema(schema, options, resolver)
    }
    return schema
  }
}

export class CopyArrayAction implements TypeConversionAction<any[]> {
  transform (
    value: any[],
    options?: JSONObject
  ): any[] {
    return value.slice()
  }
}

export const DEFAULT_ARRAY_ACTIONS: TypedActionMap<any[]> = {
  untyped: { ...DEFAULT_UNTYPED_CONVERSIONS },
  conversion: {
    create: new CreateSpecifiedArrayAction()
  },
  typed: {
    clone: new CopyArrayAction(),
    delete: new DeleteNestedValueAction<any[]>(),
    modify: new ModifyArrayAction(),
    set: new SetNestedValueAction<any[]>()
  }
}

export class ToArrayConvertor extends TypedActionsValueConvertor<any[]> {
  constructor (
    actions: TypedActionMap<any[]> = DEFAULT_ARRAY_ACTIONS
  ) {
    super('object', getArrayFrom, actions)
  }
}
