import {
  type TypeConversionAction,
  type JSONObject
} from '../schema/conversions'
import {
  TypedActionsValueConvertor,
  type TypedActionMap,
  DefaultValueAction,
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
  untyped: Object.assign(
    {
      default: new DefaultValueAction(),
      parse: new ParseToBooleanAction()
    },
    DEFAULT_UNTYPED_CONVERSIONS
  ),
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
