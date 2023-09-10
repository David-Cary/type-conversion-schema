import {
  type TypeConversionAction,
  type TypeConversionSchema,
  type TypeConversionResolver
} from '../schema/conversions'
import { type JSONObject } from '../schema/JSON'
import {
  TypedActionsValueConvertor,
  type TypedActionMap,
  DEFAULT_UNTYPED_CONVERSIONS
} from './actions'

/**
 * Reads in certain predefined values as false.
 * By default, this is just the string 'false', but other values can be passed in through the option's 'false' property.
 * @class
 * @implements {TypeConversionAction<any[], boolean>}
 */
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
/**
 * Flips the value of provided boolean from true to false and vice versa.
 * @class
 * @implements {TypeConversionAction<boolean>}
 */
export class NegateBooleanAction implements TypeConversionAction<boolean> {
  transform (value: boolean): any {
    return !value
  }
}

/**
 * Provides default actions for conversions to a boolean.
 * @const
 */
export const DEFAULT_BOOLEAN_ACTIONS: TypedActionMap<boolean> = {
  untyped: { ...DEFAULT_UNTYPED_CONVERSIONS },
  conversion: {
    parse: new ParseToBooleanAction()
  },
  typed: {
    negate: new NegateBooleanAction()
  }
}

/**
 * Handles conversion of a given value to a boolean.
 * @class
 * @implements {TypedActionsValueConvertor<boolean>}
 */
export class ToBooleanConvertor extends TypedActionsValueConvertor<boolean> {
  constructor (
    actions: TypedActionMap<boolean> = DEFAULT_BOOLEAN_ACTIONS
  ) {
    super('boolean', Boolean, actions)
  }

  prepareValue (
    value: unknown,
    schema: Partial<TypeConversionSchema>,
    resolver?: TypeConversionResolver
  ): unknown {
    if ('const' in schema && typeof schema.const === 'boolean') {
      return schema.const
    }
    value = super.prepareValue(value, schema, resolver)
    if (
      value === undefined &&
      'default' in schema &&
      typeof schema.default === 'boolean'
    ) {
      return schema.default
    }
    return value
  }
}
