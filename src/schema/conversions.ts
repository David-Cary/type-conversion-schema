import {
  type JSTypeSchema,
  type AbstractJSTypeSchema,
  type AnySchema,
  type ArraySchema,
  type BigIntSchema,
  type BooleanSchema,
  type FunctionSchema,
  type NumberSchema,
  type NullSchema,
  type ObjectSchema,
  type StringSchema,
  type SymbolSchema,
  type UndefinedSchema,
  type JSTypeSchemaReference,
  JSTypeName
} from './JSType'
import { type JSONObject } from './JSON'

/**
 * Any object that uses a 'type' string to identify them.
 * @interface
 */
export interface TypeMarkedObject extends JSONObject {
  type: string
}

/**
 * Used to request a particular type conversion or modification action.
 * @type {object | string}
 */
export type TypedActionRequest = TypeMarkedObject | string

/**
 * Covers the actions used to convert a value, separated into distinct phases.
 * @interface
 * @property {TypedActionRequest[] | undefined} prepare - actions to apply before type change
 * @property {TypedActionRequest | undefined} cpmvertVia - actions to be used to enforce the type change
 * @property {TypedActionRequest[] | undefined} finalize - actions to apply after type change
 */
export interface TypeConversionCallbacks {
  prepare?: TypedActionRequest[]
  convertVia?: TypedActionRequest
  finalize?: TypedActionRequest[]
}

/**
 * Adds type conversion callbacks to an AbstractJSTypeSchema's definitions.
 * @interface
 */
export interface AbstractTypeConversionSchema extends
  Omit<AbstractJSTypeSchema, '$defs'>,
  TypeConversionCallbacks {
  $defs?: Record<string, TypeConversionSchema | TypeConversionSchemaUnion>
}

/**
 * Adds type conversion callbacks to an ArraySchema's subschema properties.
 * @interface
 */
export interface ArrayCreationSchema extends
  Omit<ArraySchema, 'additionalItems' | 'contains' | 'items' | 'prefixItems'>,
  TypeConversionCallbacks {
  additionalItems?: TypeConversionRequest
  contains?: TypeConversionRequest
  items?: TypeConversionRequest
  prefixItems?: TypeConversionRequest[]
}

/**
 * Adds type conversion callbacks to a FunctionSchema's subschema properties.
 * @interface
 */
export interface FunctionCreationSchema extends
  Omit<FunctionSchema, 'parameters' | 'optionalParameters' | 'additionalParameters' | 'returns'>,
  TypeConversionCallbacks {
  parameters?: TypeConversionRequest[]
  optionalParameters?: TypeConversionRequest[]
  additionalParameters?: TypeConversionRequest
  returns?: TypeConversionRequest
}

/**
 * Adds type conversion callbacks to an ObjectSchema's subschema properties.
 * @interface
 */
export interface ObjectCreationSchema extends
  Omit<ObjectSchema, 'additionalProperties' | 'patternProperties' | 'properties'>,
  TypeConversionCallbacks {
  additionalProperties?: TypeConversionRequest
  patternProperties?: Record<string, TypeConversionRequest>
  properties?: Record<string, TypeConversionRequest>
}

/**
 * Covers adding type converion callbacks to BasicJSTypeSchemas.
 * @type {object}
 */
export type TypeConversionSchema = (
  (
    (
      AnySchema |
      BigIntSchema |
      BooleanSchema |
      NumberSchema |
      NullSchema |
      StringSchema |
      SymbolSchema |
      UndefinedSchema
    ) & AbstractTypeConversionSchema
  ) |
  ArrayCreationSchema |
  FunctionCreationSchema |
  ObjectCreationSchema
)

/**
 * Adds type conversion callbacks to an JSTypeSchemaUnion's subschema properties.
 * @interface
 */
export interface TypeConversionSchemaUnion extends AbstractJSTypeSchema {
  anyOf: Array<TypeConversionSchema | JSTypeName>
}

/**
 * All data types that can be used to determine how a data type conversion should be handled.
 * @type {object | JSTypeName}
 */
export type TypeConversionRequest = (
  TypeConversionSchema |
  TypeConversionSchemaUnion |
  JSTypeSchemaReference |
  JSTypeName
)

/**
 * Ensures a TypeConversionRequest is in an object format.
 * @function
 * @param {TypeConversionRequest} request - request to be coverted.
 * @returns {JSONSchema} resulting conversion schema, union, or reference
 */
export function parseTypeConversionRequest (
  request: TypeConversionRequest
): TypeConversionSchema | TypeConversionSchemaUnion | JSTypeSchemaReference {
  if (typeof request === 'string') {
    return { type: request }
  }
  return request
}

/**
 * Strips type conversion callbacks from a TypeConversionSchema.
 * @function
 * @param {TypeConversionSchema} schema - schema to be modified
 */
export function removeTypeConversionActionsFrom (
  schema: TypeConversionSchema
): void {
  if ('prepare' in schema) {
    delete schema.prepare
  }
  if ('convertVia' in schema) {
    delete schema.convertVia
  }
  if ('finalize' in schema) {
    delete schema.finalize
  }
}

/**
 * Converts a TypeConversionRequest to a javascript type schema.
 * @function
 * @param {TypeConversionRequest} request - request to be coverted
 * @returns {JSTypeSchema} resulting JSON javascript type schema
 */
export function typeConversionToJSTypeSchema (
  request: TypeConversionRequest
): JSTypeSchema {
  if (typeof request === 'string') {
    return { type: request }
  }
  const schema: Record<string, any> = { ...request }
  if ('type' in request) {
    removeTypeConversionActionsFrom(schema as TypeConversionSchema)
    switch (request.type) {
      case 'array': {
        if (request.additionalItems != null) {
          schema.additionalItems = typeConversionToJSTypeSchema(request.additionalItems)
        }
        if (request.contains != null) {
          schema.contains = typeConversionToJSTypeSchema(request.contains)
        }
        if (request.items != null) {
          schema.items = typeConversionToJSTypeSchema(request.items)
        }
        if (request.prefixItems != null) {
          schema.prefixItems = request.prefixItems.map(
            item => typeConversionToJSTypeSchema(item)
          )
        }
        break
      }
      case 'function': {
        if (request.parameters != null) {
          schema.parameters = request.parameters.map(
            item => typeConversionToJSTypeSchema(item)
          )
        }
        if (request.optionalParameters != null) {
          schema.optionalParameters = request.optionalParameters.map(
            item => typeConversionToJSTypeSchema(item)
          )
        }
        if (request.additionalParameters != null) {
          schema.additionalParameters = typeConversionToJSTypeSchema(request.additionalParameters)
        }
        if (request.returns != null) {
          schema.returns = typeConversionToJSTypeSchema(request.returns)
        }
        break
      }
      case 'object': {
        if (request.additionalProperties != null) {
          schema.additionalProperties = typeConversionToJSTypeSchema(request.additionalProperties)
        }
        if (request.patternProperties != null) {
          schema.patternProperties = convertRecordValues(
            request.patternProperties,
            typeConversionToJSTypeSchema
          )
        }
        if (request.properties != null) {
          schema.properties = convertRecordValues(
            request.properties,
            typeConversionToJSTypeSchema
          )
        }
        break
      }
    }
  } else if ('anyOf' in request) {
    schema.anyOf = request.anyOf.map(
      option => typeConversionToJSTypeSchema(option)
    )
  } else if ('$ref' in request) {
    schema.$ref = request.$ref
  }
  return schema as JSTypeSchema
}

/**
 * Gets a copy of the target object with all properties converted.
 * @template F, T
 * @function
 * @param {Record<string, F>} source - value to be coverted
 * @param {(value: F) => T} convert - conversion function to be used
 * @returns {Record<string, F>} resulting copied value map
 */
export function convertRecordValues<F, T> (
  source: Record<string, F>,
  convert: (value: F) => T
): Record<string, T> {
  const results: Record<string, T> = {}
  for (const key in source) {
    results[key] = convert(source[key])
  }
  return results
}

/**
 * Defines an operation for modifying a given value.
 * @template F, T
 * @interface
 */
export interface TypeConversionAction<F = any, T = F> {
  /**
   * Performs the target modification on a given value.
   * @function
   * @param {F} value - value to be modified
   * @param {JSONObject | undefined} options - optional modification values to be used
   * @param TypeConversionResolver | undefined} resolver - conversion resolver to be used on nested values
   * @returns {T} resulting value after modification is performed
   */
  transform: (
    value: F,
    options?: JSONObject,
    resolver?: TypeConversionResolver
  ) => T
  /**
   * Updates the provided type conversion schema to reflect the results of applying this action.
   * @function
   * @param {Partial<TypeConversionSchema>} schema - schema to be modified
   * @param {JSONObject | undefined} options - optional modification values to be used
   * @param TypeConversionResolver | undefined} resolver - conversion resolver to be used on nested values
   */
  expandSchema?: (
    schema: Partial<TypeConversionSchema>,
    options?: JSONObject,
    resolver?: TypeConversionResolver
  ) => void
}

/**
 * Contains additional information for resolving a given type conversion request.
 * This is primarily used to resolver references within the schema.
 * @interface
 * @property {Record<string, TypeConversionSchema>} schemas - map of schema definitions to use
 * @property {TypeConversionSchema | undefined} parent - parent schema to draw definitions from
 */
export interface TypeConversionContext {
  schemas: Record<string, TypeConversionSchema>
  parent?: TypeConversionSchema
}

/**
 * Handles converting an unknown value to a particular data type.
 * @template T
 * @interface
 */
export interface TypedValueConvertor<T = any> {
  /**
   * Checks if a given value is of the intended type
   * @function
   * @param {unknown} value - value to be evaluated
   * @returns {boolean} true if the value is of the intended type
   */
  matches: (value: unknown) => boolean
  /**
   * Converts the provided value to the intended type.
   * @function
   * @param {unknown} value - value to be converted
   * @returns {T} converted value
   */
  convert: (value: unknown) => T
  /**
   * Converts the provided value using a particular schema.
   * @function
   * @param {unknown} value - value to be converted
   * @param {Partial<TypeConversionSchema>} schema - schema to be used for conversion
   * @param TypeConversionResolver | undefined} resolver - conversion resolver to be used on nested values
   * @param {TypeConversionContext | undefined} context - additional values to be used for resolving references
   * @returns {T} converted value
   */
  convertWith: (
    value: unknown,
    schema: Partial<TypeConversionSchema>,
    resolver?: TypeConversionResolver,
    context?: TypeConversionContext
  ) => T
  /**
   * Updates the provided type conversion schema to reflect the results of applying this action.
   * @function
   * @param {Partial<TypeConversionSchema>} schema - schema to be modified
   * @param TypeConversionResolver | undefined} resolver - conversion resolver to be used on nested values
   */
  expandSchema?: (
    schema: Partial<TypeConversionSchema>,
    resolver?: TypeConversionResolver
  ) => void
}

/**
 * Handles conversion of a given value to a variety of types depending on the provided schema.
 * @class
 * @property {Record<string, TypedValueConvertor>} convertors - map of type specific conversion objects, keyed by type name
 */
export class TypeConversionResolver {
  readonly convertors: Record<string, TypedValueConvertor>

  constructor (convertors: Record<string, TypedValueConvertor> = {}) {
    this.convertors = convertors
  }

  /**
   * Tries to get the appropriate schema for resolving a given request.
   * @function
   * @param {TypeConversionRequest} request - conversion request to be used
   * @param {unknown} value - value to be converted
   * @param {TypeConversionContext | undefined} context - additional values to be used for resolving references
   * @returns {T} type conversion schema to use, if an appropriate one is found
   */
  getRequestSchema (
    request: TypeConversionRequest,
    value?: unknown,
    context?: TypeConversionContext
  ): TypeConversionSchema | undefined {
    if (typeof request === 'object') {
      if ('anyOf' in request) {
        for (const item of request.anyOf) {
          const schema = typeof item === 'object' ? item : { type: item }
          const convertor = this.convertors[schema.type]
          if (convertor?.matches(value)) {
            return schema
          }
        }
        const firstItem = request.anyOf[0]
        if (firstItem != null) {
          return typeof firstItem === 'object' ? firstItem : { type: firstItem }
        }
        return undefined
      }
      if ('$ref' in request) {
        const resolvedRef = this.resolveReference(request, context)
        return 'anyOf' in resolvedRef
          ? this.getRequestSchema(resolvedRef)
          : resolvedRef
      }
      return request
    }
    return {
      type: request
    }
  }

  /**
   * Returns a TypeConversionContext with the provided schema as the parent.
   * @function
   * @param {TypeConversionSchema} parent - schema to set as the parent
   * @param {TypeConversionContext | undefined} base - source of default context values
   * @returns {T} resulting subcontext
   */
  getChildContext (
    parent: TypeConversionSchema,
    base?: TypeConversionContext
  ): TypeConversionContext {
    if (base != null) {
      const context = { ...base }
      context.parent = parent
      return context
    }
    return {
      schemas: {},
      parent
    }
  }

  /**
   * Resolves a schema reference to the indicated schema.
   * @function
   * @param {JSTypeSchemaReference} reference - reference to be resolved
   * @param {TypeConversionContext | undefined} context - additional values to be used for resolving references
   * @param {TypeConversionSchema} defaultSchema - schema to be used if reference is unresolved
   * @returns {T} converted value
   */
  resolveReference (
    reference: JSTypeSchemaReference,
    context?: TypeConversionContext,
    defaultSchema: TypeConversionSchema = { type: JSTypeName.ANY }
  ): TypeConversionSchema | TypeConversionSchemaUnion {
    if (context?.schemas != null) {
      const schema = context.schemas[reference.$ref]
      if (schema != null) {
        return schema
      }
    }
    if (context?.parent?.$defs != null) {
      const steps = reference.$ref.split('/')
      if (steps[0] === '#' && steps[1] === '$defs') {
        const schemaKey = steps[2]
        const schema = context.parent.$defs[schemaKey]
        if (schema != null) {
          return schema
        }
      }
    }
    return defaultSchema
  }

  /**
   * Converts the provided value as specified by a conversion request.
   * @function
   * @param {unknown} value - value to be converted
   * @param {TypeConversionRequest} castAs - details what the value should be converted to
   * @param {TypeConversionContext | undefined} context - additional values to be used for resolving references
   * @returns {unknown} converted value
   */
  convert (
    value: unknown,
    castAs: TypeConversionRequest,
    context?: TypeConversionContext
  ): unknown {
    const schema = this.getRequestSchema(castAs, value, context)
    if (schema != null) {
      const convertor = this.convertors[schema.type]
      if (convertor != null) {
        return convertor.convertWith(value, schema, this, context)
      }
    }
  }

  /**
   * Updates all subschemas of the provided schema to reflect all effects of applying said subschemas.
   * This can also be used to convert a string request to a full schema.
   * @function
   * @param {TypeConversionRequest} source - request to be evaluated
   * @returns {T} resulting expanded schema, union, or reference
   */
  getExpandedSchema (
    source: TypeConversionRequest
  ): TypeConversionSchema | TypeConversionSchemaUnion | JSTypeSchemaReference {
    if (typeof source === 'string') {
      return { type: source }
    }
    if ('anyOf' in source) {
      const union: TypeConversionSchemaUnion = { ...source }
      union.anyOf = union.anyOf.map(
        item => this.getExpandedSchema(item) as TypeConversionSchema
      )
      return union
    }
    if ('$ref' in source) {
      return source
    }
    const schema = { ...source }
    const convertor = this.convertors[schema.type]
    if (convertor?.expandSchema != null) {
      convertor.expandSchema(schema, this)
    }
    return schema
  }
}
