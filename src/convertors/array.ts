import {
  type TypeConversionAction,
  type TypeConversionResolver,
  type TypeConversionSchema
} from '../schema/conversions'
import {
  type JSONObject,
  cloneJSON
} from '../schema/JSON'
import {
  TypedActionsValueConvertor,
  type TypedActionMap,
  getConversionSchemaFrom,
  DEFAULT_UNTYPED_CONVERSIONS
} from './actions'
import {
  type JSTypeSchema,
  type ArraySchema,
  JSTypeName
} from '../schema/JSType'

export function getArrayFrom (source: unknown): any[] {
  if (Array.isArray(source)) {
    return source
  }
  return source !== undefined ? [source] : []
}

export class CopyArrayAction implements TypeConversionAction<any[]> {
  transform (
    value: any[],
    options?: JSONObject
  ): any[] {
    if (options != null) {
      const start = 'from' in options ? Number(options.from) : 0
      if ('to' in options) {
        const end = Number(options.to)
        return value.slice(start, end)
      }
      return value.slice(start)
    }
    return value.slice()
  }
}

export class InsertArrayItemAction implements TypeConversionAction<any[]> {
  transform (
    value: any[],
    options?: JSONObject
  ): any[] {
    let index = 0
    let repeat = 1
    let itemValue: any
    if (options != null) {
      if ('index' in options) {
        index = Number(options.index)
      }
      if ('repeat' in options) {
        repeat = Number(options.repeat)
      }
      if ('value' in options) {
        itemValue = options.value
      }
    }
    const params: [start: number, deleteCount: number, ...items: any[]] = [index, 0]
    for (let i = 0; i < repeat; i++) {
      const instance = cloneJSON(itemValue)
      params.push(instance)
    }
    return value.splice.apply(null, params)
  }
}

export class RemoveArrayItemAction implements TypeConversionAction<any[]> {
  transform (
    value: any[],
    options?: JSONObject
  ): any[] {
    let index = 0
    let count = 1
    if (options != null) {
      if ('index' in options) {
        index = Number(options.index)
      }
      if ('count' in options) {
        count = Number(options.count)
      }
    }
    return value.splice(index, count)
  }
}

export class SetArrayItemAction implements TypeConversionAction<any[]> {
  transform (
    value: any[],
    options?: JSONObject,
    resolver?: TypeConversionResolver
  ): any[] {
    let index = 0
    let itemValue: any
    if (options != null) {
      if ('index' in options) {
        index = Number(options.index)
        if (index < 0) {
          index = Math.max(0, value.length + index)
        }
        itemValue = value[index]
      }
      if (resolver != null && 'to' in options) {
        const schema = getConversionSchemaFrom(options.to)
        if (schema != null) {
          itemValue = resolver.convert(itemValue, schema)
        }
      }
    }
    value[index] = itemValue
    return value
  }
}

export class ModifyArrayAction implements TypeConversionAction<any[]> {
  transform (
    value: any[],
    options?: JSONObject,
    resolver?: TypeConversionResolver
  ): any[] {
    if (options != null) {
      const schema = this.getArraySchemaFrom(options)
      this.applySchemaTo(schema, value, resolver)
    }
    return value
  }

  getArraySchemaFrom (source: JSONObject): ArraySchema {
    const schema: ArraySchema = { type: JSTypeName.ARRAY }
    if (
      typeof source.prefixItems === 'object' &&
      source.prefixItems != null &&
      Array.isArray(source.prefixItems)
    ) {
      schema.prefixItems = this.getSchemaList(source.prefixItems)
    }
    schema.items = this.getSchemaFrom(source.items)
    if ('minItems' in source) {
      schema.minItems = Number(source.minItems)
    }
    if ('maxItems' in source) {
      schema.maxItems = Number(source.maxItems)
    }
    if ('uniqueItems' in source) {
      schema.uniqueItems = Boolean(source.uniqueItems)
    }
    return schema
  }

  getSchemaList (source: any[]): JSTypeSchema[] {
    const schemas: JSTypeSchema[] = []
    for (let i = 0; i < source.length; i++) {
      const schema = this.getSchemaFrom(source[i])
      if (schema != null) {
        schemas.push(schema)
      }
    }
    return schemas
  }

  getSchemaFrom (source: any): JSTypeSchema | undefined {
    if (
      typeof source === 'object' &&
      source != null &&
      !Array.isArray(source)
    ) {
      if (typeof source.type === 'string' || Array.isArray(source.anyOf)) {
        return source as JSTypeSchema
      }
    }
  }

  applySchemaTo (
    schema: Partial<TypeConversionSchema>,
    target: any[],
    resolver?: TypeConversionResolver
  ): void {
    if ('minItems' in schema && schema.minItems != null) {
      if (target.length < schema.minItems) {
        target.length = schema.minItems
      }
    }
    if ('maxItems' in schema && schema.maxItems != null) {
      if (target.length > schema.maxItems) {
        target.length = schema.maxItems
      }
    }
    let prefixCount = 0
    if ('prefixItems' in schema && schema.prefixItems != null) {
      if (resolver != null) {
        for (let i = 0; i < schema.prefixItems.length; i++) {
          target[i] = resolver.convert(target[i], schema.prefixItems[i])
        }
      }
      prefixCount = schema.prefixItems.length
    }
    if ('items' in schema && schema.items != null) {
      const uniqueItems = ('uniqueItems' in schema && schema.uniqueItems != null)
        ? schema.uniqueItems
        : false
      for (let i = target.length - 1; i >= prefixCount; i--) {
        const value = resolver != null
          ? resolver.convert(target[i], schema.items)
          : target[i]
        if (uniqueItems && target.includes(value)) {
          target.splice(i, 1)
        } else {
          target[i] = value
        }
      }
    } else {
      target.length = prefixCount
    }
  }
}

export const DEFAULT_ARRAY_ACTIONS: TypedActionMap<any[]> = {
  untyped: { ...DEFAULT_UNTYPED_CONVERSIONS },
  conversion: {},
  typed: {
    clone: new CopyArrayAction(),
    insert: new InsertArrayItemAction(),
    modify: new ModifyArrayAction(),
    remove: new RemoveArrayItemAction(),
    set: new SetArrayItemAction()
  }
}

export class ToArrayConvertor extends TypedActionsValueConvertor<any[]> {
  readonly mutator: ModifyArrayAction = new ModifyArrayAction()

  constructor (
    actions: TypedActionMap<any[]> = DEFAULT_ARRAY_ACTIONS
  ) {
    super('object', getArrayFrom, actions)
  }

  prepareValue (
    value: unknown,
    schema: Partial<TypeConversionSchema>,
    resolver?: TypeConversionResolver
  ): unknown {
    if ('const' in schema && Array.isArray(schema.const)) {
      return schema.const.slice()
    }
    value = super.prepareValue(value, schema, resolver)
    if (
      value == null &&
      'default' in schema &&
      Array.isArray(schema.const)
    ) {
      value = schema.default.slice
    }
    return value
  }

  finalizeValue (
    value: any[],
    schema: Partial<TypeConversionSchema>,
    resolver?: TypeConversionResolver
  ): any[] {
    value = super.finalizeValue(value, schema, resolver)
    this.mutator.applySchemaTo(schema, value, resolver)
    return value
  }
}
