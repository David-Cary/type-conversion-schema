import {
  type JSTypeSchema,
  type AbstractJSTypeSchema,
  type VariedJSTypeSchema,
  type NumericJSTypeSchema,
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
  type AnyFunction,
  JSTypeName,
  JSONSchemaContentEncoding,
  getTypedArray,
  getTypedValueRecord,
  stringToJSTypeName
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
export interface TypeConversionSchemaUnion extends AbstractTypeConversionSchema {
  anyOf: TypeConversionRequest[]
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
    if (request.$defs != null) {
      schema.$defs = convertRecordValues(
        request.$defs,
        typeConversionToJSTypeSchema
      )
    }
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
          const schema = this.getRequestSchema(item, value, context)
          if (schema == null) continue
          const convertor = this.convertors[schema.type]
          if (convertor?.matches(value)) {
            return schema
          }
        }
        const firstItem = request.anyOf[0]
        return this.getRequestSchema(firstItem, value, context)
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

/**
 * Extracts a type convesion schema from the provided value.
 * @function
 * @param {any} source - value to draw the schema from
 * @returns {TypeConversionSchema | undefined} target schema, if any
 */
export function getConversionSchemaFrom (
  source: any
): TypeConversionSchema | TypeConversionSchemaUnion | JSTypeSchemaReference {
  switch (typeof source) {
    case 'object': {
      if (Array.isArray(source)) {
        return {
          anyOf: source.map(value => getConversionSchemaFrom(value))
        }
      }
      if ('$ref' in source) {
        return {
          $ref: String(source.$ref)
        }
      }
      if ('anyOf' in source) {
        const schema: TypeConversionSchemaUnion = {
          anyOf: source.map(getConversionSchemaFrom)
        }
        initAbstractConversionSchemaFrom(schema, source)
        return schema
      }
      if ('type' in source) {
        const schema: TypeConversionSchema = {
          type: stringToJSTypeName(String(source.type))
        }
        switch (source.type) {
          case 'number': {
            initNumericConversionSchemaFrom(schema, source, Number)
            break
          }
          case 'string': {
            initStringConversionSchemaFrom(
              schema as TypeConversionSchema & StringSchema,
              source
            )
            break
          }
          case 'boolean': {
            initVariedConversionSchemaFrom(schema, source, Boolean)
            break
          }
          case 'object': {
            initObjectConversionSchemaFrom(schema as ObjectCreationSchema, source)
            break
          }
          case 'array': {
            initArrayConversionSchemaFrom(schema as ArrayCreationSchema, source)
            break
          }
          case 'function': {
            initFunctionConversionSchemaFrom(schema as FunctionCreationSchema, source)
            break
          }
          case 'bigint': {
            initNumericConversionSchemaFrom(schema, source, getBigIntFrom)
            break
          }
          case 'symbol': {
            initSymbolConversionSchemaFrom(
              schema as TypeConversionSchema & SymbolSchema,
              source
            )
            break
          }
          default: {
            initAbstractConversionSchemaFrom(schema, source)
          }
        }
        return schema
      }
      break
    }
    case 'string': {
      const type = stringToJSTypeName(source)
      return { type }
    }
  }
  return { type: 'any' }
}

/**
 * Copies properties common to all types of conversion schemas from a source object.
 * @function
 * @param {AbstractTypeConversionSchema} schema - conversion schema to be modified
 * @param {Record<string, any>} source - values to be copied
 */
export function initAbstractConversionSchemaFrom (
  schema: AbstractTypeConversionSchema,
  source: Record<string, any>
): void {
  if (source.$comment != null) schema.$comment = String(source.$comment)
  if (source.$id != null) schema.$id = String(source.$id)
  if (source.$schema != null) schema.$schema = String(source.$schema)
  if (source.$anchor != null) schema.$anchor = String(source.$anchor)
  if (source.description != null) schema.description = String(source.description)
  if (source.title != null) schema.title = String(source.title)
  if (typeof source.$defs === 'object' &&
    source.$defs != null &&
    !Array.isArray(source.$defs)
  ) {
    schema.$defs = getTypedValueRecord(
      source.$defs,
      item => {
        const subschema = getConversionSchemaFrom(item)
        return subschema == null || '$ref' in subschema ? undefined : subschema
      }
    )
  }
}

/**
 * Copies properties for multi-value conversion schemas from a source object.
 * @function
 * @template T
 * @param {TypeConversionSchema & VariedJSTypeSchema<T>} schema - conversion schema to be modified
 * @param {Record<string, any>} source - values to be copied
 * @param {(value: any) => T}
 */
export function initVariedConversionSchemaFrom<T> (
  schema: TypeConversionSchema & VariedJSTypeSchema<T>,
  source: Record<string, any>,
  convert: (value: any) => T
): void {
  initAbstractConversionSchemaFrom(schema, source)
  if (source.default != null) schema.default = convert(source.default)
  if (source.const != null) schema.const = convert(source.const)
  if (Array.isArray(source.examples)) {
    schema.examples = getTypedArray(
      source.examples,
      item => item != null ? convert(item) : undefined
    )
  }
}

/**
 * Copies properties for numeric conversion schemas from a source object.
 * @function
 * @template T
 * @param {TypeConversionSchema & NumericJSTypeSchema<T>} schema - conversion schema to be modified
 * @param {Record<string, any>} source - values to be copied
 * @param {(value: any) => T}
 */
export function initNumericConversionSchemaFrom<T> (
  schema: TypeConversionSchema & NumericJSTypeSchema<T>,
  source: Record<string, any>,
  convert: (value: any) => T
): void {
  initVariedConversionSchemaFrom(schema, source, convert)
  if (source.integer != null) schema.integer = Boolean(source.integer)
  if (source.minimum != null) schema.minimum = convert(source.minimum)
  if (source.maximum != null) schema.maximum = convert(source.maximum)
  if (source.exclusiveMinimum != null) schema.exclusiveMinimum = convert(source.exclusiveMinimum)
  if (source.exclusiveMaximum != null) schema.exclusiveMaximum = convert(source.exclusiveMaximum)
  if (source.multipleOf != null) schema.multipleOf = convert(source.multiple)
}

/**
 * Copies properties for array conversion schemas from a source object.
 * @function
 * @param {ArrayCreationSchema} schema - conversion schema to be modified
 * @param {Record<string, any>} source - values to be copied
 */
export function initArrayConversionSchemaFrom (
  schema: ArrayCreationSchema,
  source: Record<string, any>
): void {
  initVariedConversionSchemaFrom(schema, source, getArrayFrom)
  if (source.additionalItems != null) {
    schema.additionalItems = getConversionSchemaFrom(source.additionalItems)
  }
  if (source.contains != null) {
    schema.contains = getConversionSchemaFrom(source.contains)
  }
  if (source.items != null) {
    schema.items = getConversionSchemaFrom(source.items)
  }
  if (source.prefixItems != null) {
    schema.prefixItems = getTypedArray(
      source.prefixItems,
      getConversionSchemaFrom
    )
  }
  if (source.minItems != null) schema.minItems = Number(source.minItems)
  if (source.maxItems != null) schema.maxItems = Number(source.maxItems)
  if (source.uniqueItems != null) schema.uniqueItems = Boolean(source.uniqueItems)
}

/**
 * Copies properties for function conversion schemas from a source object.
 * @function
 * @param {FunctionCreationSchema} schema - conversion schema to be modified
 * @param {Record<string, any>} source - values to be copied
 */
export function initFunctionConversionSchemaFrom (
  schema: FunctionCreationSchema,
  source: Record<string, any>
): void {
  initVariedConversionSchemaFrom(schema, source, getFunctionFrom)
  if (source.parameters != null) {
    schema.parameters = getTypedArray(
      source.parameters,
      getConversionSchemaFrom
    )
  }
  if (source.optionalParameters != null) {
    schema.optionalParameters = getTypedArray(
      source.optionalParameters,
      getConversionSchemaFrom
    )
  }
  if (source.additionalParameters != null) {
    schema.additionalParameters = getConversionSchemaFrom(source.additionalParameters)
  }
  if (source.returns != null) {
    schema.returns = getConversionSchemaFrom(source.returns)
  }
}

/**
 * Copies properties for object conversion schemas from a source object.
 * @function
 * @param {ObjectCreationSchema} schema - conversion schema to be modified
 * @param {Record<string, any>} source - values to be copied
 */
export function initObjectConversionSchemaFrom (
  schema: ObjectCreationSchema,
  source: Record<string, any>
): void {
  initVariedConversionSchemaFrom(schema, source, getObjectFrom)
  if (source.additionalProperties != null) {
    schema.additionalProperties = getConversionSchemaFrom(source.additionalProperties)
  }
  if (source.maxProperties != null) schema.maxProperties = Number(source.maxProperties)
  if (source.minProperties != null) schema.minProperties = Number(source.minProperties)
  if (source.patternProperties != null) {
    schema.patternProperties = getTypedValueRecord(
      source.patternProperties,
      getConversionSchemaFrom
    )
  }
  if (source.properties != null) {
    schema.properties = getTypedValueRecord(
      source.properties,
      getConversionSchemaFrom
    )
  }
  if (source.propertyNames != null) {
    schema.propertyNames = { type: JSTypeName.STRING }
    initStringConversionSchemaFrom(schema.propertyNames, source.propertyNames)
  }
  if (source.required != null) {
    schema.required = getTypedArray(source.required, String)
  }
}

/**
 * Copies properties for string conversion schemas from a source object.
 * @function
 * @param {TypeConversionSchema & StringSchem} schema - conversion schema to be modified
 * @param {Record<string, any>} source - values to be copied
 */
export function initStringConversionSchemaFrom (
  schema: TypeConversionSchema & StringSchema,
  source: Record<string, any>
): void {
  initVariedConversionSchemaFrom(schema, source, String)
  if (source.contentEncoding != null) {
    const encoding = getValueKey(
      JSONSchemaContentEncoding,
      source.contentEncoding
    )
    if (encoding != null) {
      schema.contentEncoding = encoding as JSONSchemaContentEncoding
    }
  }
  if (source.contentMediaType != null) schema.contentMediaType = String(source.contentMediaType)
  if (source.format != null) schema.format = String(source.format)
  if (source.maxLength != null) schema.maxLength = Number(source.maxLength)
  if (source.minLength != null) schema.minLength = Number(source.minLength)
  if (source.pattern != null) schema.pattern = String(source.pattern)
}

/**
 * Copies properties for symbol conversion schemas from a source object.
 * @function
 * @param {TypeConversionSchema & SymbolSchema} schema - conversion schema to be modified
 * @param {Record<string, any>} source - values to be copied
 */
export function initSymbolConversionSchemaFrom (
  schema: TypeConversionSchema & SymbolSchema,
  source: Record<string, any>
): void {
  initVariedConversionSchemaFrom(schema, source, getSymbolFrom)
  if (source.key != null) schema.key = String(source.key)
}

/**
 * Retrives the first key that corresponds to a particular value within a given collection.
 * @function
 * @param {Record<string, any>} collection - value map to be evaluated
 * @param {any} value = value to be searched for
 * @returns {string | undefined} first matching key
 */
export function getValueKey (
  collection: Record<string, any>,
  value: any
): string | undefined {
  for (const key in collection) {
    if (collection[key] === value) {
      return key
    }
  }
}

/**
 * Converts the provided value to an array.
 * This involves wrapping non-array values in an array with undefined values excluded.
 * @function
 * @param {unknown} source - value to be converted
 * @returns {any[]} source array or enclosing array for non-array sources
 */
export function getArrayFrom (source: unknown): any[] {
  if (Array.isArray(source)) {
    return source
  }
  return source !== undefined ? [source] : []
}

/**
 * Converts the provided value to a BigInt.
 * This involves wrapping non-array values in an array with undefined values excluded.
 * @function
 * @param {unknown} source - value to be converted
 * @returns {any} source array or enclosing array for non-array sources
 */
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

/**
 * Converts the provided value to a function.
 * If the value isn't already a function it will be wrapped in a fuction that returns that value.
 * @function
 * @param {any} source - value to be converted
 * @returns {AnyFunction} resulting function
 */
export function getFunctionFrom (value: any): AnyFunction {
  if (typeof value === 'function') {
    return value
  }
  return () => value
}

/**
 * Refers to any plain old javascript object.
 * @type {Record<string, unknown>}
 */
export type POJObject = Record<string, unknown>

/**
 * Converts the provided value to an object.
 * For arrays, this means remapping items to keys that match their indices.
 * For strings, JSON parse is attempted.
 * Any other values or a failed parse result in an empty object.
 * @function
 * @param {any} source - value to be converted
 * @returns {string} resulting object
 */
export function getObjectFrom (source: unknown): POJObject {
  switch (typeof source) {
    case 'object': {
      if (Array.isArray(source)) {
        const map: POJObject = {}
        for (let i = 0; i < source.length; i++) {
          map[String(i)] = source[i]
        }
        return map
      }
      if (source != null) return source as POJObject
      break
    }
    case 'string': {
      try {
        return JSON.parse(source)
      } catch (error) {
        return {}
      }
    }
  }
  return {}
}

/**
 * Converts the provided value to a symbol.
 * String are handled directly by the 'Symbol' function.
 * Any other values that aren't already symbols are converted to strings
 * before being passed to said function.
 * @function
 * @param {any} source - value to be converted
 * @returns {string} resulting object
 */
export function getSymbolFrom (value: any): symbol {
  switch (typeof value) {
    case 'string': {
      return Symbol(value)
    }
    case 'symbol': {
      return value
    }
  }
  const description = safeJSONStringify(value)
  return Symbol(description)
}

/**
 * Callback to be used as the replacer function in JSON stringify calls.
 * @type {Function}
 */
export type StringifyReplacerCallback = (this: any, key: string, value: any) => any

/**
 * Provides a fallback to failed JSON stringify attempts.
 * @function
 * @param {any} source - value to be converted
 * @param {StringifyReplacerCallback | Array<string | number> | null | undefined} replacer - replacer to pass in to JSON stringify.
 * @param {number | string} space - spacing value to be used by JSON stringify
 * @returns {string} resulting string
 */
export function safeJSONStringify (
  source: any,
  replacer?: StringifyReplacerCallback | Array<string | number> | null,
  space?: number | string
): string {
  try {
    // Redundant, but appeases typescript.
    if (typeof replacer === 'function') {
      return JSON.stringify(source, replacer, space)
    }
    return JSON.stringify(source, replacer, space)
  } catch (error) {
    return String(source)
  }
}

export class InterfaceEnforcer<T extends object> {
  readonly schema: ObjectCreationSchema

  constructor (schema: ObjectCreationSchema) {
    this.schema = schema
  }

  applyTo (
    value: Record<string, any>,
    resolver: TypeConversionResolver,
    context?: TypeConversionContext
  ): T {
    const result = resolver.convert(value, this.schema, context) as T
    return result
  }
}
