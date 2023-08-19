import {
  type TypeConversionAction,
  type TypeConversionResolver
} from '../schema/conversions'
import { type JSONObject } from '../schema/JSON'
import {
  type JSTypeSchema,
  type BasicJSTypeSchema,
  type FunctionSchema,
  type AnyFunction,
  JSTypeName,
  createBasicSchema
} from '../schema/JSType'
import {
  TypedActionsValueConvertor,
  type TypedActionMap,
  getConversionSchemaFrom,
  DEFAULT_UNTYPED_CONVERSIONS
} from './actions'
import { getConversionRequestFrom } from './object'
import { getArrayFrom } from './array'

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

  createSchema (
    options?: JSONObject,
    resolver?: TypeConversionResolver
  ): BasicJSTypeSchema {
    const schema: FunctionSchema = { type: JSTypeName.FUNCTION }
    if (options != null) {
      if (options.parameters != null) {
        schema.parameters = this.getParameterSchemas(options.parameters)
      }
      if (options.optionalParameters != null) {
        schema.optionalParameters = this.getParameterSchemas(options.optionalParameters)
      }
    }
    return schema
  }

  getParameterSchema (
    source: any,
    resolver?: TypeConversionResolver
  ): JSTypeSchema {
    const request = getConversionRequestFrom(source)
    if (request != null) {
      if (resolver != null) {
        const resolved = resolver.createJSTypeSchema(request)
        if (resolved != null) return resolved
      }
      let typeName = 'any'
      if (typeof request === 'object' && 'type' in request) {
        typeName = request.type
      } else if (typeof request === 'string') {
        typeName = request
      }
      if (typeName in Object.values(JSTypeName)) {
        const type = typeName as JSTypeName
        return createBasicSchema(type)
      }
    }
    return { type: 'any' }
  }

  getParameterSchemas (
    source: any,
    resolver?: TypeConversionResolver
  ): JSTypeSchema[] {
    const rawParams = getArrayFrom(source)
    const conversions = rawParams.map(param => this.getParameterSchema(param))
    return conversions
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
