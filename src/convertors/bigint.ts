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

export class PositiveBigIntAction implements TypeConversionAction<bigint> {
  transform (value: bigint): bigint {
    return value < 0 ? -value : value
  }

  expandSchema (
    schema: Partial<TypeConversionSchema>,
    options?: JSONObject
  ): void {
    if (schema.type === 'bigint') {
      if (schema.minimum === undefined || schema.minimum < 0) {
        schema.minimum = 0n
      }
    }
  }
}

export class NegativeBigIntAction implements TypeConversionAction<bigint> {
  transform (value: bigint): bigint {
    return value > 0 ? -value : value
  }

  expandSchema (
    schema: Partial<TypeConversionSchema>,
    options?: JSONObject
  ): void {
    if (schema.type === 'bigint') {
      if (schema.maximum === undefined || schema.maximum > 0) {
        schema.maximum = 0n
      }
    }
  }
}

export const DEFAULT_BIG_INT_ACTIONS: TypedActionMap<bigint> = {
  untyped: { ...DEFAULT_UNTYPED_CONVERSIONS },
  conversion: {},
  typed: {
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

  prepareValue (
    value: unknown,
    schema: Partial<TypeConversionSchema>,
    resolver?: TypeConversionResolver
  ): unknown {
    if ('const' in schema && typeof schema.const === 'bigint') {
      return schema.const
    }
    value = super.prepareValue(value, schema, resolver)
    if (
      value == null &&
      'default' in schema &&
      typeof schema.default === 'bigint'
    ) {
      value = schema.default
    }
    return value
  }

  finalizeValue (
    value: bigint,
    schema: Partial<TypeConversionSchema>,
    resolver?: TypeConversionResolver
  ): bigint {
    value = this.enforceRange(value, schema)
    if ('multipleOf' in schema && typeof schema.multipleOf === 'bigint') {
      const halfStep = schema.multipleOf / 2n
      value = schema.multipleOf * ((value + halfStep) / schema.multipleOf)
    }
    value = super.finalizeValue(value, schema, resolver)
    return value
  }

  enforceRange (
    value: bigint,
    schema: Partial<TypeConversionSchema>
  ): bigint {
    if ('minimum' in schema && typeof schema.minimum === 'bigint') {
      if (value < schema.minimum) {
        value = schema.minimum
      }
    } else if ('exclusiveMinimum' in schema && typeof schema.exclusiveMinimum === 'bigint') {
      if (value <= schema.exclusiveMinimum) {
        value = schema.exclusiveMinimum + 1n
      }
    }
    if ('maximum' in schema && typeof schema.maximum === 'bigint') {
      if (value > schema.maximum) {
        value = schema.maximum
      }
    } else if ('exclusiveMaximum' in schema && typeof schema.exclusiveMaximum === 'bigint') {
      if (value >= schema.exclusiveMaximum) {
        value = schema.exclusiveMaximum - 1n
      }
    }
    return value
  }

  finalizeSchema (
    schema: Partial<TypeConversionSchema>,
    resolver?: TypeConversionResolver
  ): void {
    if (schema.type === 'bigint') {
      schema.integer = true
    }
    super.finalizeSchema(schema, resolver)
  }
}
