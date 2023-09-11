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

/**
 * Retrieves a nested property value for a given path.
 * @function
 * @param {amy} source - object the value should be drawn from
 * @param {any} path - key or array of keys to use to get the value
 * @returns {any} retrieved value, if any
 */
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

/**
 * Handles redirecting to a nested value for the next step of a value conversion.
 * The path to the target value is taken from the option of the same name.
 * @class
 * @implements {TypeConversionAction}
 */
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

/**
 * Tries to cast the provided value to an action request.
 * @function
 * @param {amy} source - value to be cast
 * @returns {any} recast value, if valid
 */
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

/**
 * Extracts a type convesion schema from the provided value.
 * @function
 * @param {any} source - value to draw the schema from
 * @returns {TypeConversionSchema | undefined} target schema, if any
 */
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

/**
 * Applies a conversion schema to the current value before passing it on the next action.
 * The schema to be used is passed in through the "to" option.
 * @class
 * @implements {TypeConversionAction}
 */
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

/**
 * Provides default conversion action handles for untyped values.
 * @const
 */
export const DEFAULT_UNTYPED_CONVERSIONS = {
  convert: new NestedConversionAction(),
  get: new GetValueAction()
}

/**
 * Provides conversion action handlers, grouped by whether it's applied before, after, or during conversion.
 * @template T
 * @interface
 * @property {Record<string, TypeConversionAction<T>>} typed - actions to be performed after the type is set
 * @property {Record<string, TypeConversionAction<any>>} untyped - actions to be performed before the type is set
 * @property {Record<string, TypeConversionAction<any, T>>} typed - actions to be used to set the type
 */
export interface TypedActionMap<T> {
  typed: Record<string, TypeConversionAction<T>>
  untyped: Record<string, TypeConversionAction<any>>
  conversion: Record<string, TypeConversionAction<any, T>>
}

/**
 * Handles conversion of a given value to a variety of types depending on the provided schema.
 * @template T
 * @class
 * @implements {TypedValueConvertor<T>}
 * @property {string} typeName - associated javascript schema type name
 * @property {(value: unknown) => T} convert - default function for conversion to the target type
 * @property {TypedActionMap<T>} actions - map of action resolution handlers
 */
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

  /**
   * Applies pre-conversion actions to the provided value.
   * @function
   * @param {unknown} value - value to be modified
   * @param {Partial<TypeConversionSchema>} schema - schema to be used for conversion
   * @param TypeConversionResolver | undefined} resolver - conversion resolver to be used on nested values
   * @param {TypeConversionContext | undefined} context - additional values to be used for resolving references
   * @returns {unknown} modified value
   */
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

  /**
   * Applies post-conversion actions to the provided value.
   * @function
   * @param {unknown} value - value to be modified
   * @param {Partial<TypeConversionSchema>} schema - schema to be used for conversion
   * @param TypeConversionResolver | undefined} resolver - conversion resolver to be used on nested values
   * @param {TypeConversionContext | undefined} context - additional values to be used for resolving references
   * @returns {unknown} modified value
   */
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

  /**
   * Applies pre-conversion actions to the provided schema.
   * @function
   * @param {Partial<TypeConversionSchema>} schema - schema to be modified
   * @param TypeConversionResolver | undefined} resolver - conversion resolver to be used on nested values
   */
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

  /**
   * Applies post-conversion actions to the provided schema.
   * @function
   * @param {Partial<TypeConversionSchema>} schema - schema to be modified
   * @param TypeConversionResolver | undefined} resolver - conversion resolver to be used on nested values
   */
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

  /**
   * Helper function for applying schema updates from a particular action request.
   * @function
   * @param {Partial<TypeConversionSchema>} schema - schema to be modified
   * @param {TypedActionRequest} request - action request to be used
   * @param {Record<string, TypeConversionAction<any>>} actionMap - action map to use for the provided request
   * @param TypeConversionResolver | undefined} resolver - conversion resolver to be used on nested values
   */
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
