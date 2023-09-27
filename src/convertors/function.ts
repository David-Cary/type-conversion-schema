import {
  type TypeConversionAction,
  type TypeConversionResolver,
  type TypeConversionSchema,
  getConversionSchemaFrom,
  getFunctionFrom
} from '../schema/conversions'
import { type JSONObject } from '../schema/JSON'
import {
  type AnyFunction,
  JSTypeName
} from '../schema/JSType'
import {
  TypedActionsValueConvertor,
  type TypedActionMap,
  DEFAULT_UNTYPED_CONVERSIONS
} from './actions'

/**
 * Creates a function that returns the provided value.
 * If a 'returns' option is provided, that will be used as a conversion schema to be applied to the provided value.
 * @class
 * @implements {TypeConversionAction<any, AnyFunction>}
 */
export class CreateWrapperFunctionAction implements TypeConversionAction<any, AnyFunction> {
  transform (
    value: any,
    options?: JSONObject,
    resolver?: TypeConversionResolver
  ): AnyFunction {
    if (typeof value === 'function') {
      return value
    }
    if (options?.returns != null && resolver != null) {
      const returnSchema = getConversionSchemaFrom(options.returns)
      return () => resolver.convert(value, returnSchema)
    }
    return () => value
  }

  expandSchema (
    schema: Partial<TypeConversionSchema>,
    options?: JSONObject
  ): void {
    if (schema.type === JSTypeName.FUNCTION && options?.returns != null) {
      const returnSchema = getConversionSchemaFrom(options.returns)
      schema.returns = returnSchema
    }
  }
}

/**
 * Provides default actions for conversions to a function.
 * @const
 */
export const DEFAULT_FUNCTION_ACTIONS: TypedActionMap<AnyFunction> = {
  untyped: { ...DEFAULT_UNTYPED_CONVERSIONS },
  conversion: {
    wrap: new CreateWrapperFunctionAction()
  },
  typed: {}
}

/**
 * Handles conversion of a given value to a function.
 * @class
 * @implements {TypedActionsValueConvertor<AnyFunction>}
 */
export class ToFunctionConvertor extends TypedActionsValueConvertor<AnyFunction> {
  constructor (
    actions: TypedActionMap<AnyFunction> = DEFAULT_FUNCTION_ACTIONS
  ) {
    super('function', getFunctionFrom, actions)
  }
}
