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
 * Rounds the provided number to the nearest integer value.
 * @class
 * @implements {TypeConversionAction<number>}
 */
export class RoundNumberAction implements TypeConversionAction<number> {
  transform (value: number): number {
    return Math.round(value)
  }

  expandSchema (
    schema: Partial<TypeConversionSchema>,
    options?: JSONObject
  ): void {
    if (schema.type === 'number') {
      schema.integer = true
    }
  }
}

/**
 * Rounds the provided number to the next highest integer value.
 * @class
 * @implements {RoundNumberAction}
 */
export class RoundUpNumberAction extends RoundNumberAction {
  transform (value: number): number {
    return Math.ceil(value)
  }
}

/**
 * Rounds the provided number to the next lowest integer value.
 * @class
 * @implements {RoundNumberAction}
 */
export class RoundDownNumberAction extends RoundNumberAction {
  transform (value: number): number {
    return Math.floor(value)
  }
}

/**
 * Forces the value to a positive number, flipping the value of negatives.
 * @class
 * @implements {TypeConversionAction<number>}
 */
export class PositiveNumberAction implements TypeConversionAction<number> {
  transform (value: number): number {
    return value < 0 ? -value : value
  }

  expandSchema (
    schema: Partial<TypeConversionSchema>,
    options?: JSONObject
  ): void {
    if (schema.type === 'number') {
      if (schema.minimum === undefined || schema.minimum < 0) {
        schema.minimum = 0
      }
    }
  }
}

/**
 * Forces the value to a negative number, flipping the value of positives.
 * @class
 * @implements {TypeConversionAction<number>}
 */
export class NegativeNumberAction implements TypeConversionAction<number> {
  transform (value: number): number {
    return value > 0 ? -value : value
  }

  expandSchema (
    schema: Partial<TypeConversionSchema>,
    options?: JSONObject
  ): void {
    if (schema.type === 'number') {
      if (schema.maximum === undefined || schema.maximum > 0) {
        schema.maximum = 0
      }
    }
  }
}

/**
 * Provides default actions for conversions to a number.
 * @const
 */
export const DEFAULT_NUMBER_ACTIONS: TypedActionMap<number> = {
  untyped: { ...DEFAULT_UNTYPED_CONVERSIONS },
  conversion: {},
  typed: {
    negative: new NegativeNumberAction(),
    positive: new PositiveNumberAction(),
    round: new RoundNumberAction(),
    roundDown: new RoundDownNumberAction(),
    roundUp: new RoundUpNumberAction()
  }
}

/**
 * Handles conversion of a given value to a number.
 * @class
 * @implements {TypedActionsValueConvertor<number>}
 */
export class ToNumberConvertor extends TypedActionsValueConvertor<number> {
  constructor (
    actions: TypedActionMap<number> = DEFAULT_NUMBER_ACTIONS
  ) {
    super('number', Number, actions)
  }

  prepareValue (
    value: unknown,
    schema: Partial<TypeConversionSchema>,
    resolver?: TypeConversionResolver
  ): unknown {
    if ('const' in schema && typeof schema.const === 'number') {
      return schema.const
    }
    value = super.prepareValue(value, schema, resolver)
    return value
  }

  finalizeValue (
    value: number,
    schema: Partial<TypeConversionSchema>,
    resolver?: TypeConversionResolver
  ): number {
    if (
      isNaN(value) &&
      'default' in schema &&
      typeof schema.default === 'number'
    ) {
      value = schema.default
    }
    value = this.enforceRange(value, schema)
    if ('multipleOf' in schema && typeof schema.multipleOf === 'number') {
      value = schema.multipleOf * Math.round(value / schema.multipleOf)
    }
    value = super.finalizeValue(value, schema, resolver)
    return value
  }

  enforceRange (
    value: number,
    schema: Partial<TypeConversionSchema>
  ): number {
    if ('minimum' in schema && typeof schema.minimum === 'number') {
      if (value < schema.minimum) {
        value = schema.minimum
      }
    } else if ('exclusiveMinimum' in schema && typeof schema.exclusiveMinimum === 'number') {
      if (value <= schema.exclusiveMinimum) {
        const offset = schema.integer === true ? 1 : 0.1
        value = schema.exclusiveMinimum + offset
      }
    }
    if ('maximum' in schema && typeof schema.maximum === 'number') {
      if (value > schema.maximum) {
        value = schema.maximum
      }
    } else if ('exclusiveMaximum' in schema && typeof schema.exclusiveMaximum === 'number') {
      if (value >= schema.exclusiveMaximum) {
        const offset = schema.integer === true ? -1 : -0.1
        value = schema.exclusiveMaximum + offset
      }
    }
    return value
  }

  finalizeSchema (
    schema: Partial<TypeConversionSchema>,
    resolver?: TypeConversionResolver
  ): void {
    if ('multipleOf' in schema && typeof schema.multipleOf === 'number') {
      schema.integer = schema.multipleOf % 1 === 0
    }
    super.finalizeSchema(schema, resolver)
  }
}
