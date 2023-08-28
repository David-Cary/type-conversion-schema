import {
  type TypeConversionAction,
  type TypeConversionResolver,
  type TypeConversionSchema
} from '../schema/conversions'
import { type JSONObject } from '../schema/JSON'
import {
  type AnyFunction,
  JSTypeName
} from '../schema/JSType'
import {
  TypedActionsValueConvertor,
  type TypedActionMap,
  getConversionSchemaFrom,
  DEFAULT_UNTYPED_CONVERSIONS
} from './actions'

export function getFunctionFrom (value: any): AnyFunction {
  if (typeof value === 'function') {
    return value
  }
  return () => value
}

export class CreateWrapperFunctionAction implements TypeConversionAction<any, AnyFunction> {
  transform (
    value: any,
    options?: JSONObject,
    resolver?: TypeConversionResolver
  ): AnyFunction {
    if (typeof value === 'function') {
      return value
    }
    if (options != null && resolver != null) {
      const returnSchema = getConversionSchemaFrom(options.returns)
      if (returnSchema != null) {
        return () => resolver.convert(value, returnSchema)
      }
    }
    return () => value
  }

  expandSchema (
    schema: Partial<TypeConversionSchema>,
    options?: JSONObject
  ): void {
    if (schema.type === JSTypeName.FUNCTION) {
      const returnSchema = getConversionSchemaFrom(options?.returns)
      if (returnSchema != null) {
        schema.returns = returnSchema
      }
    }
  }
}

export const DEFAULT_FUNCTION_ACTIONS: TypedActionMap<AnyFunction> = {
  untyped: { ...DEFAULT_UNTYPED_CONVERSIONS },
  conversion: {
    wrap: new CreateWrapperFunctionAction()
  },
  typed: {}
}

export class ToFunctionConvertor extends TypedActionsValueConvertor<AnyFunction> {
  constructor (
    actions: TypedActionMap<AnyFunction> = DEFAULT_FUNCTION_ACTIONS
  ) {
    super('function', getFunctionFrom, actions)
  }
}
