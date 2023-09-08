import {
  type TypeConversionAction,
  type TypedActionRequest,
  type TypeMarkedObject,
  type TypedValueConvertor,
  type TypeConversionResolver,
  type TypeConversionSchema,
  type TypeConversionContext
} from '../schema/conversions'
import {
  getTypedArray,
  getExtendedTypeOf,
  stringToJSTypeName
} from '../schema/JSType'
import {
  type JSONObject
} from '../schema/JSON'

export function getNestedValue (
  source: any,
  path: any
): any {
  if (typeof source === 'object' && source != null) {
    let target = source
    const steps = Array.isArray(path) ? path : [path]
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i]
      if (typeof target === 'object' && target != null) {
        if (Array.isArray(target)) {
          const index = Number(step)
          if (isNaN(index)) return undefined
          target = target[index]
        } else {
          const key = String(step)
          target = target[key]
        }
      } else return undefined
    }
    return target
  }
  return source
}

export class GetValueAction implements TypeConversionAction {
  transform (
    value: any,
    options?: JSONObject
  ): any {
    if (options?.path != null) {
      return getNestedValue(value, options.path)
    }
    return value
  }
}

export function getActionRequestFrom (
  source: any
): TypedActionRequest | undefined {
  switch (typeof source) {
    case 'string': {
      return source
    }
    case 'object': {
      if (
        typeof source === 'object' &&
        source != null &&
        typeof source.type === 'string'
      ) {
        return source
      }
      break
    }
  }
}

export function getConversionSchemaFrom (source: any): TypeConversionSchema | undefined {
  switch (typeof source) {
    case 'string': {
      return { type: stringToJSTypeName(source) }
    }
    case 'object': {
      if (source != null && !Array.isArray(source)) {
        const schema: TypeConversionSchema = {
          type: stringToJSTypeName(String(source.type))
        }
        if (Array.isArray(source.prepare)) {
          schema.prepare = getTypedArray(
            source.prepare,
            item => getActionRequestFrom(item)
          )
        }
        if (source.convertVia != null) {
          schema.convertVia = getActionRequestFrom(source.convertVia)
        }
        if (Array.isArray(source.finalize)) {
          schema.finalize = getTypedArray(
            source.finalize,
            item => getActionRequestFrom(item)
          )
        }
        return schema
      }
      break
    }
  }
}

export class NestedConversionAction implements TypeConversionAction {
  transform (
    value: any,
    options?: JSONObject,
    resolver?: TypeConversionResolver
  ): any {
    if (resolver != null && options != null) {
      const schema = getConversionSchemaFrom(options.to)
      if (schema != null) {
        return resolver.convert(value, schema)
      }
    }
    return value
  }

  expandSchema (
    schema: Partial<TypeConversionSchema>,
    options?: JSONObject,
    resolver?: TypeConversionResolver
  ): void {
    if (resolver != null && options != null) {
      const subschema = getConversionSchemaFrom(options.to)
      if (subschema != null) {
        const resolved = resolver.getExpandedSchema(subschema) as unknown
        options.to = resolved as JSONObject
      }
    }
  }
}

export const DEFAULT_UNTYPED_CONVERSIONS = {
  convert: new NestedConversionAction(),
  get: new GetValueAction()
}

export interface TypedActionMap<T> {
  typed: Record<string, TypeConversionAction<T>>
  untyped: Record<string, TypeConversionAction<any>>
  conversion: Record<string, TypeConversionAction<any, T>>
}

export type VisitActionCallback<F, T = F> = (
  action: TypeConversionAction<F, T>,
  options?: JSONObject
) => void

export class TypedActionsValueConvertor<T = any> implements TypedValueConvertor<T> {
  readonly typeName: string
  readonly convert: (value: unknown) => T
  readonly actions: TypedActionMap<T>

  constructor (
    typeName: string,
    convert: (value: unknown) => T,
    actions: Partial<TypedActionMap<T>> = {}
  ) {
    this.typeName = typeName
    this.convert = convert
    this.actions = {
      untyped: actions.typed != null ? { ...actions.untyped } : DEFAULT_UNTYPED_CONVERSIONS,
      conversion: actions.conversion != null ? { ...actions.conversion } : {},
      typed: actions.typed != null ? { ...actions.typed } : {}
    }
  }

  matches (value: unknown): boolean {
    return getExtendedTypeOf(value) === this.typeName
  }

  convertWith (
    value: unknown,
    schema: Partial<TypeConversionSchema>,
    resolver?: TypeConversionResolver,
    context?: TypeConversionContext
  ): T {
    const untypedResult = this.prepareValue(value, schema, resolver, context)
    let schemaConversion: T | undefined
    if (schema.convertVia != null) {
      const options = this.expandActionRequest(schema.convertVia)
      const action = this.actions.conversion[options.type]
      if (action != null) {
        schemaConversion = action.transform(untypedResult, options, resolver)
      }
    }
    let typedResult = schemaConversion != null
      ? schemaConversion
      : this.convert(untypedResult)
    typedResult = this.finalizeValue(typedResult, schema, resolver, context)
    return typedResult
  }

  prepareValue (
    value: unknown,
    schema: Partial<TypeConversionSchema>,
    resolver?: TypeConversionResolver,
    context?: TypeConversionContext
  ): unknown {
    if (schema.prepare != null) {
      for (const request of schema.prepare) {
        const options = this.expandActionRequest(request)
        const action = this.actions.untyped[options.type]
        if (action != null) {
          value = action.transform(value, options, resolver)
        }
      }
    }
    return value
  }

  finalizeValue (
    value: T,
    schema: Partial<TypeConversionSchema>,
    resolver?: TypeConversionResolver,
    context?: TypeConversionContext
  ): T {
    if (schema.finalize != null) {
      for (const request of schema.finalize) {
        const options = this.expandActionRequest(request)
        const action = this.actions.typed[options.type]
        if (action != null) {
          value = action.transform(value, options, resolver)
        }
      }
    }
    return value
  }

  expandActionRequest (request: TypedActionRequest): TypeMarkedObject {
    return typeof request === 'object' ? request : { type: request }
  }

  expandSchema (
    schema: Partial<TypeConversionSchema>,
    resolver?: TypeConversionResolver
  ): void {
    this.prepareSchema(schema, resolver)
    if (schema.convertVia != null) {
      this.expandSchemaFor(schema, schema.convertVia, this.actions.conversion, resolver)
    }
    this.finalizeSchema(schema, resolver)
  }

  prepareSchema (
    schema: Partial<TypeConversionSchema>,
    resolver?: TypeConversionResolver
  ): void {
    if (schema.prepare != null) {
      for (const request of schema.prepare) {
        this.expandSchemaFor(schema, request, this.actions.untyped, resolver)
      }
    }
  }

  finalizeSchema (
    schema: Partial<TypeConversionSchema>,
    resolver?: TypeConversionResolver
  ): void {
    if (schema.finalize != null) {
      for (const request of schema.finalize) {
        this.expandSchemaFor(schema, request, this.actions.typed, resolver)
      }
    }
  }

  expandSchemaFor (
    schema: Partial<TypeConversionSchema>,
    request: TypedActionRequest,
    actionMap: Record<string, TypeConversionAction<any>>,
    resolver?: TypeConversionResolver
  ): void {
    const options = this.expandActionRequest(request)
    const action = actionMap[options.type]
    if (action?.expandSchema != null) {
      action.expandSchema(schema, options, resolver)
    }
  }
}
