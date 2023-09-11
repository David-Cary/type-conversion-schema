import {
  type TypeConversionAction,
  type TypeConversionResolver,
  type TypeConversionSchema,
  type TypeConversionContext
} from '../schema/conversions'
import { type JSONObject } from '../schema/JSON'
import {
  TypedActionsValueConvertor,
  type TypedActionMap,
  getNestedValue,
  DEFAULT_UNTYPED_CONVERSIONS
} from './actions'
import { cloneJSON } from '../schema/JSON'

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
 * Wraps the provided value in an object.
 * The key for the wrapped value is taken from the 'key' option, defaulting to 'value'.
 * @class
 * @implements {TypeConversionAction<any, POJObject>}
 */
export class CreateWrapperObjectAction implements TypeConversionAction<any, POJObject> {
  transform (
    value: any,
    options?: JSONObject
  ): POJObject {
    if (
      options?.asNeeded === true &&
      typeof value === 'object' &&
      value != null &&
      !Array.isArray(value)
    ) {
      return value
    }
    const key = options?.key != null ? String(options.key) : 'value'
    return { [key]: value }
  }
}

/**
 * Gets a copy of the provided object that excludes all values whose key is in the option's 'properties' array.
 * @class
 * @implements {TypeConversionAction<POJObject>}
 */
export class OmitPropertiesAction implements TypeConversionAction<POJObject> {
  transform (
    value: POJObject,
    options?: JSONObject
  ): POJObject {
    if (options != null && Array.isArray(options.properties)) {
      const results: POJObject = {}
      for (const key in value) {
        if (!options.properties.includes(key)) {
          results[key] = value[key]
        }
      }
      return results
    }
    return { ...value }
  }
}

/**
 * Gets a copy of the provided object that only includes values whose key is in the option's 'properties' array.
 * @class
 * @implements {TypeConversionAction<POJObject>}
 */
export class PickPropertiesAction implements TypeConversionAction<POJObject> {
  transform (
    value: POJObject,
    options?: JSONObject
  ): POJObject {
    if (options != null && Array.isArray(options.properties)) {
      const results: POJObject = {}
      for (const key in value) {
        if (options.properties.includes(key)) {
          results[key] = value[key]
        }
      }
      return results
    }
    return {}
  }
}

/**
 * Modifies a nested value within the provided object / array.
 * The path to the target value is taken from the option of the same name.
 * The value to be assigned can be set directly through the 'value' option.
 * If the 'from' option is set, the set value will be results of a getNestedValue call using the 'from' option as the path.
 * If the 'default' option is set, that will be used if the retrieved value is undefined.
 * @template T
 * @class
 * @implements {TypeConversionAction<T>}
 */
export class SetNestedValueAction<T> implements TypeConversionAction<T> {
  transform (
    value: T,
    options?: JSONObject
  ): T {
    if (options?.path != null) {
      let propertyValue = (options.from != null)
        ? getNestedValue(value, options.from)
        : options.value
      if (propertyValue === undefined && options.default !== undefined) {
        propertyValue = options.default
      }
      this.setNestedValue(value, options.path, propertyValue)
    }
    return value
  }

  /**
   * Helper function that performs the actual value assignment for this action.
   * @function
   * @param {any} collection - top level value to be modified
   * @param {any} path - key or array of keys indicating the property to be set
   * @param {unknown} value - value to be used at the target location
   */
  setNestedValue (
    collection: any,
    path: any,
    value: unknown
  ): void {
    let target = collection
    const steps = Array.isArray(path) ? path : [path]
    const finalIndex = steps.length - 1
    if (finalIndex >= 0) {
      for (let i = 0; i < finalIndex; i++) {
        const step = steps[i]
        if (typeof target === 'object' && target != null) {
          if (Array.isArray(target)) {
            const index = Number(step)
            if (isNaN(index)) return
            const nextTarget = target[index] ?? this.createCollectionFor(steps[i + 1])
            if (nextTarget != null) {
              target[index] = nextTarget
              target = nextTarget
            } else return
          } else {
            const key = String(step)
            const nextTarget = target[key] ?? this.createCollectionFor(steps[i + 1])
            if (nextTarget != null) {
              target[key] = nextTarget
              target = nextTarget
            } else return
          }
        } else return
      }
      if (typeof target === 'object' && target != null) {
        const step = steps[finalIndex]
        if (Array.isArray(target)) {
          const index = Number(step)
          if (isNaN(index)) return
          target[index] = value
        } else {
          const key = String(step)
          target[key] = value
        }
      }
    }
  }

  /**
   * Helper function that creates a wrapper object or array, depending on the type of key provided.
   * @function
   * @param {any} key - key to be used
   * @Returns {POJObject | any[] | undefined} an empty object for string keys, an empty array for number keys, or undefined for an invalid key
   */
  createCollectionFor (key: any): POJObject | any[] | undefined {
    switch (typeof key) {
      case 'string': {
        return {}
      }
      case 'number': {
        return []
      }
    }
  }
}

/**
 * Removes a nested value within the provided object / array.
 * The path to the target value is taken from the option of the same name.
 * @template T
 * @class
 * @implements {TypeConversionAction<T>}
 */
export class DeleteNestedValueAction<T> implements TypeConversionAction<T> {
  transform (
    value: T,
    options?: JSONObject
  ): T {
    if (options?.path != null) {
      this.deleteNestedValue(value, options.path)
    }
    return value
  }

  /**
   * Helper function that performs the actual removal of the target value.
   * @function
   * @param {any} collection - object / array containing the target value
   * @param {any} path - key or key array to the target value.
   */
  deleteNestedValue (
    collection: any,
    path: any
  ): void {
    const steps = Array.isArray(path) ? path : [path]
    const finalIndex = steps.length - 1
    if (finalIndex >= 0) {
      const targetPath = steps.slice(0, finalIndex)
      const target = getNestedValue(collection, targetPath)
      if (typeof target === 'object' && target != null) {
        const step = steps[finalIndex]
        if (Array.isArray(target)) {
          const index = Number(step)
          if (isNaN(index)) return
          target.splice(index, 1)
        } else {
          const key = String(step)
          if (key in target) {
            /* eslint-disable @typescript-eslint/no-dynamic-delete */
            delete target[key]
          }
        }
      }
    }
  }
}

/**
 * Provides default actions for conversions to an object.
 * @const
 */
export const DEFAULT_OBJECT_ACTIONS: TypedActionMap<POJObject> = {
  untyped: { ...DEFAULT_UNTYPED_CONVERSIONS },
  conversion: {
    wrap: new CreateWrapperObjectAction()
  },
  typed: {
    delete: new DeleteNestedValueAction<POJObject>(),
    omit: new OmitPropertiesAction(),
    pick: new PickPropertiesAction(),
    set: new SetNestedValueAction<POJObject>()
  }
}

/**
 * Handles conversion of a given value to an object.
 * @class
 * @implements {TypedActionsValueConvertor<POJObject>}
 */
export class ToObjectConvertor extends TypedActionsValueConvertor<POJObject> {
  readonly clone: (value: any) => any

  constructor (
    actions: TypedActionMap<POJObject> = DEFAULT_OBJECT_ACTIONS,
    cloneVia: (value: any) => any = cloneJSON
  ) {
    super('object', getObjectFrom, actions)
    this.clone = cloneVia
  }

  prepareValue (
    value: unknown,
    schema: Partial<TypeConversionSchema>,
    resolver?: TypeConversionResolver
  ): unknown {
    if ('const' in schema && typeof schema.const === 'object') {
      return this.clone(schema.const)
    }
    value = super.prepareValue(value, schema, resolver)
    if (
      value == null &&
      'default' in schema &&
      typeof schema.default === 'object'
    ) {
      value = this.clone(schema.default)
    }
    return value
  }

  finalizeValue (
    value: POJObject,
    schema: Partial<TypeConversionSchema>,
    resolver?: TypeConversionResolver,
    context?: TypeConversionContext
  ): POJObject {
    value = super.finalizeValue(value, schema, resolver, context)
    this.applySchemaTo(schema, value, resolver, context)
    return value
  }

  /**
   * Helper function that enforces object schema restrictions on the target object.
   * @function
   * @param {Partial<TypeConversionSchema>} schema - schema to be used
   * @param {POJObject} value - object to be modified
   * @param TypeConversionResolver | undefined} resolver - conversion resolver to be used on nested values
   * @param {TypeConversionContext | undefined} context - additional values to be used for resolving references
   */
  applySchemaTo (
    schema: Partial<TypeConversionSchema>,
    target: POJObject,
    resolver?: TypeConversionResolver,
    context?: TypeConversionContext
  ): void {
    const properties = ('properties' in schema && schema.properties != null)
      ? schema.properties
      : {}
    let childContext = context
    if (resolver != null) {
      const fullSchema = Object.assign(
        { type: 'object' },
        schema
      )
      childContext = resolver.getChildContext(fullSchema, context)
      for (const key in properties) {
        target[key] = resolver.convert(
          target[key],
          properties[key],
          childContext
        )
      }
    }
    const additionalProperties = ('additionalProperties' in schema)
      ? schema.additionalProperties
      : undefined
    const patternProperties = ('patternProperties' in schema && schema.patternProperties != null)
      ? schema.patternProperties
      : {}
    for (const key in target) {
      if (key in properties) continue
      if (additionalProperties == null) {
        /* eslint-disable @typescript-eslint/no-dynamic-delete */
        delete target[key]
      } else if (resolver != null) {
        let patternMatched = false
        for (const pattern in patternProperties) {
          const exp = new RegExp(pattern)
          patternMatched = exp.test(key)
          if (patternMatched) {
            target[key] = resolver.convert(
              target[key],
              patternProperties[pattern],
              childContext
            )
            break
          }
        }
        if (patternMatched) continue
        target[key] = resolver.convert(
          target[key],
          additionalProperties,
          childContext
        )
      }
    }
  }
}
