import {
  type TypeConversionAction,
  type JSONObject
} from '../schema/conversions'
import {
  TypedActionsValueConvertor,
  type TypedActionMap,
  ForceValueAction
} from './actions'
import { type JSONSchema } from 'json-schema-typed'

export class DefaultNumberAction implements TypeConversionAction<number> {
  transform (
    value: number,
    options?: JSONObject
  ): number {
    return isNaN(value) ? Number(options?.value) : value
  }
}

export class RoundNumberAction implements TypeConversionAction<number> {
  transform (
    value: number,
    options?: JSONObject
  ): number {
    return Math.round(value)
  }

  modifySchema (
    schema: JSONSchema,
    options?: JSONObject
  ): void {
    if (typeof schema === 'object') {
      schema.type = 'integer'
    }
  }
}

export class RoundUpNumberAction extends RoundNumberAction {
  transform (
    value: number,
    options?: JSONObject
  ): number {
    return Math.ceil(value)
  }
}

export class RoundDownNumberAction extends RoundNumberAction {
  transform (
    value: number,
    options?: JSONObject
  ): number {
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
    schema: JSONSchema,
    options?: JSONObject
  ): void {
    if (typeof schema === 'object') {
      schema.multipleOf = getNumberWithDefault(options?.value, 1)
      schema.type = schema.multipleOf % 1 === 0 ? 'integer' : 'number'
    }
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
    schema: JSONSchema,
    options?: JSONObject
  ): void {
    if (options != null && typeof schema === 'object') {
      const minimum = Number(options.value)
      if (!isNaN(minimum)) {
        schema.minimum = minimum
        if (minimum % 1 !== 0) schema.type = 'number'
      }
    }
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
    schema: JSONSchema,
    options?: JSONObject
  ): void {
    if (options != null && typeof schema === 'object') {
      const maximum = Number(options.value)
      if (!isNaN(maximum)) {
        schema.maximum = maximum
        if (maximum % 1 !== 0) schema.type = 'number'
      }
    }
  }
}

export class PositiveNumberAction implements TypeConversionAction<number> {
  transform (
    value: number,
    options?: JSONObject
  ): number {
    return value < 0 ? -value : value
  }

  modifySchema (
    schema: JSONSchema,
    options?: JSONObject
  ): void {
    if (typeof schema === 'object') {
      if (schema.minimum === undefined || schema.minimum < 0) {
        schema.minimum = 0
      }
    }
  }
}

export class NegativeNumberAction implements TypeConversionAction<number> {
  transform (
    value: number,
    options?: JSONObject
  ): number {
    return value > 0 ? -value : value
  }

  modifySchema (
    schema: JSONSchema,
    options?: JSONObject
  ): void {
    if (typeof schema === 'object') {
      if (schema.maximum === undefined || schema.maximum > 0) {
        schema.maximum = 0
      }
    }
  }
}

export const DEFAULT_NUMBER_ACTIONS: TypedActionMap<number> = {
  untyped: {
    setTo: new ForceValueAction()
  },
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
