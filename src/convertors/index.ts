import { ToArrayConvertor } from './array'
import { ToBigIntConvertor } from './bigint'
import { ToBooleanConvertor } from './boolean'
import { ToLiteralConvertor } from './literal'
import { ToNumberConvertor } from './number'
import { ToObjectConvertor } from './object'
import { ToStringConvertor } from './string'
import { ToSymbolConvertor } from './symbol'

export * from './actions'
export * from './array'
export * from './bigint'
export * from './boolean'
export * from './literal'
export * from './number'
export * from './object'
export * from './string'
export * from './symbol'

export const DEFAULT_TYPE_CONVERTORS = {
  array: new ToArrayConvertor(),
  bigint: new ToBigIntConvertor(),
  boolean: new ToBooleanConvertor(),
  null: new ToLiteralConvertor(null),
  number: new ToNumberConvertor(),
  object: new ToObjectConvertor(),
  string: new ToStringConvertor(),
  symbol: new ToSymbolConvertor(),
  undefined: new ToLiteralConvertor(undefined)
}
