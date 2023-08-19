import {
  type TypeConversionAction,
  type TypedActionRequest,
  type TypeMarkedObject,
  type TypedValueConvertor,
  type TypeConversionResolver,
  type TypeConversionSchema
} from '../schema/conversions'
import {
  type BasicJSTypeSchema,
  JSTypeName,
  getTypedArray,
  getExtendedTypeOf,
  createBasicSchema
} from '../schema/JSType'
import {
  type JSONObject,
  cloneJSON
} from '../schema/JSON'

export class ForceValueAction implements TypeConversionAction {
  transform (
    value: any,
    options?: JSONObject
  ): any {
    return cloneJSON(options?.value)
  }
}

export class DefaultValueAction implements TypeConversionAction {
  transform (
    value: any,
    options?: JSONObject
  ): any {
    return value === undefined ? cloneJSON(options?.value) : value
  }
}

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
      return { type: source }
    }
    case 'object': {
      if (source != null && !Array.isArray(source)) {
        const schema: TypeConversionSchema = {
          type: String(source.type)
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

  createSchema (
    options?: JSONObject,
    resolver?: TypeConversionResolver
  ): BasicJSTypeSchema {
    if (resolver != null && options != null) {
      const schema = getConversionSchemaFrom(options.to)
      if (schema != null) {
        const resolved = resolver.createJSTypeSchema(schema)
        if (resolved != null) {
          if ('type' in resolved) {
            return resolved
          }
          if (resolved.anyOf?.length > 0) {
            return resolved.anyOf[0]
          }
        }
      }
    }
    return { type: 'any' }
  }
}

export const DEFAULT_UNTYPED_CONVERSIONS = {
  convert: new NestedConversionAction(),
  default: new DefaultValueAction(),
  get: new GetValueAction(),
  setTo: new ForceValueAction()
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
    resolver?: TypeConversionResolver
  ): T {
    let untypedResult = value
    this.runPreparation(
      schema,
      (
        action: TypeConversionAction<any>,
        options?: JSONObject
      ) => {
        untypedResult = action.transform(untypedResult, options, resolver)
      }
    )
    let conversionResult: T | undefined
    this.runConversion(
      schema,
      (
        action: TypeConversionAction<any, T>,
        options?: JSONObject
      ) => {
        conversionResult = action.transform(untypedResult, options, resolver)
      }
    )
    let typedResult = conversionResult != null
      ? conversionResult
      : this.convert(untypedResult)
    this.runFinalization(
      schema,
      (
        action: TypeConversionAction<T>,
        options?: JSONObject
      ) => {
        typedResult = action.transform(typedResult, options, resolver)
      }
    )
    return typedResult
  }

  expandActionRequest (request: TypedActionRequest): TypeMarkedObject {
    return typeof request === 'object' ? request : { type: request }
  }

  runPreparation (
    schema: Partial<TypeConversionSchema>,
    callback: VisitActionCallback<any>
  ): void {
    if (schema.prepare != null) {
      for (const request of schema.prepare) {
        const options = this.expandActionRequest(request)
        const action = this.actions.untyped[options.type]
        if (action != null) {
          callback(action, options)
        }
      }
    }
  }

  runConversion (
    schema: Partial<TypeConversionSchema>,
    callback: VisitActionCallback<any, T>
  ): void {
    if (schema.convertVia != null) {
      const options = this.expandActionRequest(schema.convertVia)
      const action = this.actions.conversion[options.type]
      if (action != null) {
        callback(action, options)
      }
    }
  }

  runFinalization (
    schema: Partial<TypeConversionSchema>,
    callback: VisitActionCallback<T>
  ): void {
    if (schema.finalize != null) {
      for (const request of schema.finalize) {
        const options = this.expandActionRequest(request)
        const action = this.actions.typed[options.type]
        if (action != null) {
          callback(action, options)
        }
      }
    }
  }

  createJSTypeSchema (
    source?: Partial<TypeConversionSchema>,
    resolver?: TypeConversionResolver
  ): BasicJSTypeSchema {
    if (source != null && resolver != null) {
      let untypedResult: BasicJSTypeSchema | undefined
      this.runPreparation(
        source,
        (
          action: TypeConversionAction<any>,
          options?: JSONObject
        ) => {
          untypedResult = this.getModifiedSchema(
            action,
            options,
            resolver,
            untypedResult
          )
        }
      )
      this.runConversion(
        source,
        (
          action: TypeConversionAction<any, T>,
          options?: JSONObject
        ) => {
          untypedResult = this.getModifiedSchema(
            action,
            options,
            resolver,
            untypedResult
          )
        }
      )
      const typedResult = this.initializeJSTypeSchema(untypedResult, source)
      this.runFinalization(
        source,
        (
          action: TypeConversionAction<T>,
          options?: JSONObject
        ) => {
          const modifiedSchema = this.getModifiedSchema(
            action,
            options,
            resolver,
            typedResult
          )
          if (modifiedSchema != null) {
            untypedResult = modifiedSchema
          }
        }
      )
      return typedResult
    }
    return this.initializeJSTypeSchema()
  }

  getModifiedSchema (
    action: TypeConversionAction,
    options?: JSONObject,
    resolver?: TypeConversionResolver,
    source?: BasicJSTypeSchema
  ): BasicJSTypeSchema | undefined {
    if (source != null && action.modifySchema != null) {
      return action.modifySchema(source, options, resolver)
    }
    if (action.createSchema != null) {
      return action.createSchema(options, resolver)
    }
  }

  initializeJSTypeSchema (
    source?: BasicJSTypeSchema,
    conversion?: Partial<TypeConversionSchema>
  ): BasicJSTypeSchema {
    if (source != null && 'type' in source && source.type === this.typeName) {
      return source
    }
    if (this.typeName in Object.values(JSTypeName)) {
      const type = this.typeName as JSTypeName
      return createBasicSchema(type)
    }
    return { type: 'any' }
  }
}
