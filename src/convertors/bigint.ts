import { type TypeConversionAction } from '../schema/conversions'
import { type JSONObject } from '../schema/JSON'
import {
  TypedActionsValueConvertor,
  type TypedActionMap,
  DEFAULT_UNTYPED_CONVERSIONS
} from './actions'
import { type BasicJSTypeSchema } from '../schema/JSType'

export function getBigIntFrom (
  value: any,
  defaultValue: bigint = 0n
): bigint {
  switch (typeof value) {
    case 'number':
    case 'string':
    case 'boolean': {
      return BigInt(value)
    }
    case 'bigint': {
      return value
    }
  }
  return defaultValue
}

export class BigIntToMultipleOfAction implements TypeConversionAction<bigint> {
  transform (
    value: bigint,
    options?: JSONObject
  ): bigint {
    const multiplier = getBigIntFrom(options?.value, 1n)
    const offset = multiplier / 2n
    const multiples = (value + offset) / multiplier
    return multiplier * multiples
  }

  modifySchema (
    schema: BasicJSTypeSchema,
    options?: JSONObject
  ): BasicJSTypeSchema {
    if (schema.type === 'bigint') {
      schema.multipleOf = getBigIntFrom(options?.value, 1n)
    }
    return schema
  }
}

export class MinimumBigIntAction implements TypeConversionAction<bigint> {
  transform (
    value: bigint,
    options?: JSONObject
  ): bigint {
    if (options != null) {
      const minimum = getBigIntFrom(options.value)
      if (value < minimum) {
        return minimum
      }
    }
    return value
  }

  modifySchema (
    schema: BasicJSTypeSchema,
    options?: JSONObject
  ): BasicJSTypeSchema {
    if (schema.type === 'bigint' && options != null) {
      schema.minimum = getBigIntFrom(options.value)
    }
    return schema
  }
}

export class MaximumBigIntAction implements TypeConversionAction<bigint> {
  transform (
    value: bigint,
    options?: JSONObject
  ): bigint {
    if (options != null) {
      const maximum = getBigIntFrom(options.value)
      if (value > maximum) {
        return maximum
      }
    }
    return value
  }

  modifySchema (
    schema: BasicJSTypeSchema,
    options?: JSONObject
  ): BasicJSTypeSchema {
    if (schema.type === 'bigint' && options != null) {
      schema.maximum = getBigIntFrom(options.value)
    }
    return schema
  }
}

export class PositiveBigIntAction implements TypeConversionAction<bigint> {
  transform (value: bigint): bigint {
    return value < 0 ? -value : value
  }

  modifySchema (
    schema: BasicJSTypeSchema,
    options?: JSONObject
  ): BasicJSTypeSchema {
    if (schema.type === 'bigint') {
      if (schema.minimum === undefined || schema.minimum < 0) {
        schema.minimum = 0n
      }
    }
    return schema
  }
}

export class NegativeBigIntAction implements TypeConversionAction<bigint> {
  transform (value: bigint): bigint {
    return value > 0 ? -value : value
  }

  modifySchema (
    schema: BasicJSTypeSchema,
    options?: JSONObject
  ): BasicJSTypeSchema {
    if (schema.type === 'bigint') {
      if (schema.maximum === undefined || schema.maximum > 0) {
        schema.maximum = 0n
      }
    }
    return schema
  }
}

export const DEFAULT_BIG_INT_ACTIONS: TypedActionMap<bigint> = {
  untyped: { ...DEFAULT_UNTYPED_CONVERSIONS },
  conversion: {},
  typed: {
    max: new MaximumBigIntAction(),
    min: new MinimumBigIntAction(),
    multiple: new BigIntToMultipleOfAction(),
    negative: new NegativeBigIntAction(),
    positive: new PositiveBigIntAction()
  }
}

export class ToBigIntConvertor extends TypedActionsValueConvertor<bigint> {
  constructor (
    actions: TypedActionMap<bigint> = DEFAULT_BIG_INT_ACTIONS
  ) {
    super('bigint', getBigIntFrom, actions)
  }

  initializeJSTypeSchema (source?: BasicJSTypeSchema): BasicJSTypeSchema {
    const schema = super.initializeJSTypeSchema(source)
    if (schema.type === 'bigint') {
      schema.integer = true
    }
    return schema
  }
}
