import {
  type TypeConversionAction,
  type TypeConversionResolver
} from '../schema/conversions'
import { type JSONObject } from '../schema/JSON'
import {
  type BasicJSTypeSchema,
  type SymbolSchema,
  JSTypeName
} from '../schema/JSType'
import {
  TypedActionsValueConvertor,
  type TypedActionMap,
  DEFAULT_UNTYPED_CONVERSIONS
} from './actions'
import { safeJSONStringify } from './string'

export function getSymbolFrom (value: any): symbol {
  switch (typeof value) {
    case 'string': {
      return Symbol(value)
    }
    case 'symbol': {
      return value
    }
  }
  const description = safeJSONStringify(value)
  return Symbol(description)
}

export class CreateKeySymbolAction implements TypeConversionAction<any, symbol> {
  transform (
    value: any,
    options?: JSONObject
  ): symbol {
    if (options != null && typeof options.key === 'string') {
      return Symbol.for(options.key)
    }
    if (typeof value === 'string') {
      return Symbol.for(value)
    }
    return getSymbolFrom(value)
  }

  createSchema (
    options?: JSONObject,
    resolver?: TypeConversionResolver
  ): BasicJSTypeSchema {
    const schema: SymbolSchema = { type: JSTypeName.SYMBOL }
    if (options != null && typeof options.value === 'string') {
      schema.key = options.value
    }
    return schema
  }
}

export const DEFAULT_SYMBOL_ACTIONS: TypedActionMap<symbol> = {
  untyped: { ...DEFAULT_UNTYPED_CONVERSIONS },
  conversion: {
    forKey: new CreateKeySymbolAction()
  },
  typed: {}
}

export class ToSymbolConvertor extends TypedActionsValueConvertor<symbol> {
  constructor (
    actions: TypedActionMap<symbol> = DEFAULT_SYMBOL_ACTIONS
  ) {
    super('symbol', getSymbolFrom, actions)
  }
}
