import { ToBooleanConvertor } from './boolean'
import { ToLiteralConvertor } from './literal'
import { ToNumberConvertor } from './number'
import { ToStringConvertor } from './string'

export * from './actions'
export * from './boolean'
export * from './literal'
export * from './number'
export * from './string'

export const DEFAULT_TYPE_CONVERTORS = {
  boolean: new ToBooleanConvertor(),
  null: new ToLiteralConvertor(null),
  number: new ToNumberConvertor(),
  string: new ToStringConvertor(),
  undefined: new ToLiteralConvertor(undefined)
}
