import {
  type TypeConversionAction,
  type JSONObject
} from '../schema/conversions'
import {
  TypedActionsValueConvertor,
  type TypedActionMap,
  DefaultValueAction,
  ForceValueAction
} from './actions'

export class NegateBooleanAction implements TypeConversionAction<boolean> {
  transform (
    value: boolean,
    options?: JSONObject
  ): any {
    return !value
  }
}

export const DEFAULT_BOOLEAN_ACTIONS: TypedActionMap<boolean> = {
  untyped: {
    default: new DefaultValueAction(),
    setTo: new ForceValueAction()
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
