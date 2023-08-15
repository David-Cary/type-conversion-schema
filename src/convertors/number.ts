import { type TypeConversionAction } from '../schema/conversions'
import { type JSONObject } from '../schema/JSON'
import {
  TypedActionsValueConvertor,
  type TypedActionMap,
  DEFAULT_UNTYPED_CONVERSIONS
} from './actions'
import { type BasicJSTypeSchema } from '../schema/JSType'

export class DefaultNumberAction implements TypeConversionAction<number> {
  transform (
    value: number,
    options?: JSONObject
  ): number {
    return isNaN(value) ? Number(options?.value) : value
  }
}

export class RoundNumberAction implements TypeConversionAction<number> {
  transform (value: number): number {
    return Math.round(value)
  }

  modifySchema (
    schema: BasicJSTypeSchema,
    options?: JSONObject
  ): BasicJSTypeSchema {
    if (schema.type === 'number') {
      schema.integer = true
    }
    return schema
  }
}

export class RoundUpNumberAction extends RoundNumberAction {
  transform (value: number): number {
    return Math.ceil(value)
  }
}

export class RoundDownNumberAction extends RoundNumberAction {
  transform (value: number): number {
    return Math.floor(value)
  }
}

export function getNumberWithDefault (
  source: any,
  defaultValue: number = 0
): number {
  const converted = Number(source)
  return isNaN(converted) ? defaultValue : converted
}

export class NumberToMultipleOfAction implements TypeConversionAction<number> {
  transform (
    value: number,
    options?: JSONObject
  ): number {
    const offset = getNumberWithDefault(options?.offset, 0.5)
    const multiplier = getNumberWithDefault(options?.value, 1)
    return multiplier * Math.floor((value / multiplier) + offset)
  }

  modifySchema (
    schema: BasicJSTypeSchema,
    options?: JSONObject
  ): BasicJSTypeSchema {
    if (schema.type === 'number') {
      schema.multipleOf = getNumberWithDefault(options?.value, 1)
      schema.integer = schema.multipleOf % 1 === 0
    }
    return schema
  }
}

export class MinimumNumberAction implements TypeConversionAction<number> {
  transform (
    value: number,
    options?: JSONObject
  ): number {
    if (options != null) {
      const minimum = Number(options.value)
      if (!isNaN(minimum) && value < minimum) {
        return minimum
      }
    }
    return value
  }

  modifySchema (
    schema: BasicJSTypeSchema,
    options?: JSONObject
  ): BasicJSTypeSchema {
    if (schema.type === 'number' && options != null) {
      const minimum = Number(options.value)
      if (!isNaN(minimum)) {
        schema.minimum = minimum
        if (minimum % 1 !== 0) schema.integer = false
      }
    }
    return schema
  }
}

export class MaximumNumberAction implements TypeConversionAction<number> {
  transform (
    value: number,
    options?: JSONObject
  ): number {
    if (options != null) {
      const maximum = Number(options.value)
      if (!isNaN(maximum) && value > maximum) {
        return maximum
      }
    }
    return value
  }

  modifySchema (
    schema: BasicJSTypeSchema,
    options?: JSONObject
  ): BasicJSTypeSchema {
    if (schema.type === 'number' && options != null) {
      const maximum = Number(options.value)
      if (!isNaN(maximum)) {
        schema.maximum = maximum
        if (maximum % 1 !== 0) schema.integer = false
      }
    }
    return schema
  }
}

export class PositiveNumberAction implements TypeConversionAction<number> {
  transform (value: number): number {
    return value < 0 ? -value : value
  }

  modifySchema (
    schema: BasicJSTypeSchema,
    options?: JSONObject
  ): BasicJSTypeSchema {
    if (schema.type === 'number') {
      if (schema.minimum === undefined || schema.minimum < 0) {
        schema.minimum = 0
      }
    }
    return schema
  }
}

export class NegativeNumberAction implements TypeConversionAction<number> {
  transform (value: number): number {
    return value > 0 ? -value : value
  }

  modifySchema (
    schema: BasicJSTypeSchema,
    options?: JSONObject
  ): BasicJSTypeSchema {
    if (schema.type === 'number') {
      if (schema.maximum === undefined || schema.maximum > 0) {
        schema.maximum = 0
      }
    }
    return schema
  }
}

export const DEFAULT_NUMBER_ACTIONS: TypedActionMap<number> = {
  untyped: { ...DEFAULT_UNTYPED_CONVERSIONS },
  conversion: {},
  typed: {
    default: new DefaultNumberAction(),
    max: new MaximumNumberAction(),
    min: new MinimumNumberAction(),
    multiple: new NumberToMultipleOfAction(),
    negative: new NegativeNumberAction(),
    positive: new PositiveNumberAction(),
    round: new RoundNumberAction(),
    roundDown: new RoundDownNumberAction(),
    roundUp: new RoundUpNumberAction()
  }
}

export class ToNumberConvertor extends TypedActionsValueConvertor<number> {
  constructor (
    actions: TypedActionMap<number> = DEFAULT_NUMBER_ACTIONS
  ) {
    super('number', Number, actions)
  }
}
