import {
  type TypeConversionAction
} from '../schema/conversions'
import { type JSONObject } from '../schema/JSON'
import {
  TypedActionsValueConvertor,
  type TypedActionMap,
  DEFAULT_UNTYPED_CONVERSIONS
} from './actions'

export class ParseToBooleanAction implements TypeConversionAction<any, boolean> {
  transform (
    value: any,
    options?: JSONObject
  ): boolean {
    const falseValues = options?.false != null
      ? (Array.isArray(options.false) ? options.false : [options.false])
      : ['false']
    if (falseValues.includes(value)) return false
    return Boolean(value)
  }
}

export class NegateBooleanAction implements TypeConversionAction<boolean> {
  transform (value: boolean): any {
    return !value
  }
}

export const DEFAULT_BOOLEAN_ACTIONS: TypedActionMap<boolean> = {
  untyped: { ...DEFAULT_UNTYPED_CONVERSIONS },
  conversion: {
    parse: new ParseToBooleanAction()
  },
  typed: {
    negate: new NegateBooleanAction()
  }
}

export class ToBooleanConvertor extends TypedActionsValueConvertor<boolean> {
  constructor (
    actions: TypedActionMap<boolean> = DEFAULT_BOOLEAN_ACTIONS
  ) {
    super('boolean', Boolean, actions)
  }
}
