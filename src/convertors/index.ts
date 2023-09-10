import { ToAnyConvertor } from './any'
import { ToArrayConvertor } from './array'
import { ToBigIntConvertor } from './bigint'
import { ToBooleanConvertor } from './boolean'
import { ToFunctionConvertor } from './function'
import { ToLiteralConvertor } from './literal'
import { ToNumberConvertor } from './number'
import { ToObjectConvertor } from './object'
import { ToStringConvertor } from './string'
import { ToSymbolConvertor } from './symbol'

export * from './any'
export * from './actions'
export * from './array'
export * from './bigint'
export * from './boolean'
export * from './function'
export * from './literal'
export * from './number'
export * from './object'
export * from './string'
export * from './symbol'

/**
 * Provides default type conversion handlers.
 * @const
 */
export const DEFAULT_TYPE_CONVERTORS = {
  any: new ToAnyConvertor(),
  array: new ToArrayConvertor(),
  bigint: new ToBigIntConvertor(),
  boolean: new ToBooleanConvertor(),
  function: new ToFunctionConvertor(),
  null: new ToLiteralConvertor(null),
  number: new ToNumberConvertor(),
  object: new ToObjectConvertor(),
  string: new ToStringConvertor(),
  symbol: new ToSymbolConvertor(),
  undefined: new ToLiteralConvertor(undefined)
}
