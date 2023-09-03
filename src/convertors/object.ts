import {
  type TypeConversionAction,
  type TypeConversionResolver,
  type TypeConversionSchema
} from '../schema/conversions'
import { type JSONObject } from '../schema/JSON'
import {
  TypedActionsValueConvertor,
  type TypedActionMap,
  getNestedValue,
  DEFAULT_UNTYPED_CONVERSIONS
} from './actions'
import { cloneJSON } from '../schema/JSON'

export type POJObject = Record<string, unknown>

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

export class CreateWrapperObjectAction implements TypeConversionAction<any, POJObject> {
  transform (
    value: any,
    options?: JSONObject
  ): POJObject {
    const key = options?.key != null ? String(options.key) : 'value'
    return { [key]: value }
  }
}

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
    resolver?: TypeConversionResolver
  ): POJObject {
    value = super.finalizeValue(value, schema, resolver)
    this.applySchemaTo(schema, value, resolver)
    return value
  }

  applySchemaTo (
    schema: Partial<TypeConversionSchema>,
    target: POJObject,
    resolver?: TypeConversionResolver
  ): void {
    const properties = ('properties' in schema && schema.properties != null)
      ? schema.properties
      : {}
    if (resolver != null) {
      for (const key in properties) {
        target[key] = resolver.convert(target[key], properties[key])
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
            target[key] = resolver.convert(target[key], patternProperties[pattern])
            break
          }
        }
        if (patternMatched) continue
        target[key] = resolver.convert(target[key], additionalProperties)
      }
    }
  }
}
