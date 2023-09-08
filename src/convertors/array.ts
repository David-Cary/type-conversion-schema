import {
  type TypeConversionAction,
  type TypeConversionResolver,
  type TypeConversionSchema,
  type TypeConversionContext
} from '../schema/conversions'
import {
  type JSONObject,
  cloneJSON
} from '../schema/JSON'
import {
  TypedActionsValueConvertor,
  type TypedActionMap,
  DEFAULT_UNTYPED_CONVERSIONS
} from './actions'
import {
  DeleteNestedValueAction,
  SetNestedValueAction
} from './object'

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
        const toPosition = Number(options.to)
        if (toPosition !== -1) {
          const end = toPosition + 1
          return value.slice(start, end)
        }
      }
      return value.slice(start)
    }
    return value.slice()
  }
}

export class ParseArrayStringAction implements TypeConversionAction<any, any[]> {
  transform (
    value: any,
    options?: JSONObject
  ): any[] {
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value)
        return getArrayFrom(parsed)
      } catch (error) {
        return [value]
      }
    }
    return getArrayFrom(value)
  }
}

export class InsertArrayItemAction implements TypeConversionAction<any[]> {
  transform (
    value: any[],
    options?: JSONObject
  ): any[] {
    let index = value.length
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
    value.splice.apply(value, params)
    return value
  }
}

export class DeleteArrayItemAction implements TypeConversionAction<any[]> {
  transform (
    value: any[],
    options?: JSONObject
  ): any[] {
    let index = -1
    let count = 1
    if (options != null) {
      if ('index' in options) {
        index = Number(options.index)
      }
      if ('count' in options) {
        count = Number(options.count)
      }
    }
    value.splice(index, count)
    return value
  }
}

export const DEFAULT_ARRAY_ACTIONS: TypedActionMap<any[]> = {
  untyped: { ...DEFAULT_UNTYPED_CONVERSIONS },
  conversion: {
    parse: new ParseArrayStringAction()
  },
  typed: {
    clone: new CopyArrayAction(),
    delete: new DeleteNestedValueAction<any[]>(),
    deleteItem: new DeleteArrayItemAction(),
    insert: new InsertArrayItemAction(),
    set: new SetNestedValueAction<any[]>()
  }
}

export class ToArrayConvertor extends TypedActionsValueConvertor<any[]> {
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
    resolver?: TypeConversionResolver,
    context?: TypeConversionContext
  ): any[] {
    value = super.finalizeValue(value, schema, resolver, context)
    this.applySchemaTo(schema, value, resolver, context)
    return value
  }

  applySchemaTo (
    schema: Partial<TypeConversionSchema>,
    target: any[],
    resolver?: TypeConversionResolver,
    context?: TypeConversionContext
  ): void {
    let prefixCount = 0
    const fullSchema = Object.assign(
      { type: 'array' },
      schema
    )
    let itemContext = resolver != null
      ? resolver.getChildContext(fullSchema, context)
      : context
    if ('prefixItems' in schema && schema.prefixItems != null) {
      if (resolver != null) {
        for (let i = 0; i < schema.prefixItems.length; i++) {
          target[i] = resolver.convert(
            target[i],
            schema.prefixItems[i],
            itemContext
          )
        }
      }
      prefixCount = schema.prefixItems.length
    }
    if ('items' in schema && schema.items != null) {
      const uniqueItems = ('uniqueItems' in schema && schema.uniqueItems != null)
        ? schema.uniqueItems
        : false
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
      if (resolver != null) {
        for (let i = target.length - 1; i >= prefixCount; i--) {
          target[i] = resolver.convert(
            target[i],
            schema.items,
            itemContext
          )
        }
      }
      if (uniqueItems) {
        for (let i = target.length - 1; i >= prefixCount; i--) {
          const value = target[i]
          const matchIndex = target.indexOf(value)
          if (matchIndex < i) {
            target.splice(i, 1)
          }
        }
      }
    } else {
      target.length = prefixCount
    }
  }
}
