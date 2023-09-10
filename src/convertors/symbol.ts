import {
  type TypeConversionAction,
  type TypeConversionSchema
} from '../schema/conversions'
import { type JSONObject } from '../schema/JSON'
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

/**
 * Handles using the symbol for a particular key string.
 * @class
 * @implements {TypeConversionAction<any, symbol>}
 */
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

  expandSchema (
    schema: Partial<TypeConversionSchema>,
    options?: JSONObject
  ): void {
    if (
      schema.type === 'symbol' &&
      options != null &&
      typeof options.key === 'string'
    ) {
      schema.key = options.key
    }
  }
}

/**
 * Provides default actions for conversions to a symbol.
 * @const
 */
export const DEFAULT_SYMBOL_ACTIONS: TypedActionMap<symbol> = {
  untyped: { ...DEFAULT_UNTYPED_CONVERSIONS },
  conversion: {
    forKey: new CreateKeySymbolAction()
  },
  typed: {}
}

/**
 * Handles conversion of a given value to a symbol.
 * @class
 * @implements {TypedActionsValueConvertor<symbol>}
 */
export class ToSymbolConvertor extends TypedActionsValueConvertor<symbol> {
  constructor (
    actions: TypedActionMap<symbol> = DEFAULT_SYMBOL_ACTIONS
  ) {
    super('symbol', getSymbolFrom, actions)
  }
}
