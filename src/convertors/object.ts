import {
  type TypeConversionAction,
  type TypeConversionRequest,
  type TypeConversionResolver,
  type TypeConversionSchema
} from '../schema/conversions'
import { type JSONObject } from '../schema/JSON'
import {
  TypedActionsValueConvertor,
  type TypedActionMap,
  DEFAULT_UNTYPED_CONVERSIONS
} from './actions'
import { cloneJSON } from '../schema/JSON'
import {
  type JSTypeSchema,
  type ObjectSchema,
  JSTypeName,
  getExtendedTypeOf,
  stringToJSTypeName
} from '../schema/JSType'

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

export function getConversionRequestFrom (source: any): TypeConversionRequest | undefined {
  if (typeof source === 'string') return stringToJSTypeName(source)
  if (
    typeof source === 'object' &&
    source != null &&
    ('type' in source || 'anyOf' in source)
  ) {
    return source as TypeConversionRequest
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

export class ModifyObjectPropertiesAction implements TypeConversionAction<POJObject> {
  transform (
    value: POJObject,
    options?: JSONObject,
    resolver?: TypeConversionResolver
  ): POJObject {
    if (options != null) {
      const schema = this.getObjectSchemaFrom(options)
      this.applySchemaTo(schema, value, resolver)
    }
    return value
  }

  getObjectSchemaFrom (source: JSONObject): ObjectSchema {
    const schema: ObjectSchema = { type: JSTypeName.OBJECT }
    if (
      typeof source.properties === 'object' &&
      source.properties != null &&
      !Array.isArray(source.properties)
    ) {
      schema.properties = this.getSchemaMap(source.properties)
    }
    schema.additionalProperties = this.getSchemaFrom(source.additionalProperties)
    if (
      typeof source.patternProperties === 'object' &&
      source.patternProperties != null &&
      !Array.isArray(source.patternProperties)
    ) {
      schema.patternProperties = this.getSchemaMap(source.patternProperties)
    }
    return schema
  }

  getSchemaMap (source: Record<string, any>): Record<string, JSTypeSchema> {
    const map: Record<string, JSTypeSchema> = {}
    for (const key in source) {
      const schema = this.getSchemaFrom(source[key])
      if (schema != null) {
        map[key] = schema
      }
    }
    return map
  }

  getSchemaFrom (source: any): JSTypeSchema | undefined {
    if (
      typeof source === 'object' &&
      source != null &&
      !Array.isArray(source)
    ) {
      if (typeof source.type === 'string' || Array.isArray(source.anyOf)) {
        return source as JSTypeSchema
      }
    }
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

export class SetObjectPropertiesAction extends ModifyObjectPropertiesAction {
  transform (
    value: POJObject,
    options?: JSONObject,
    resolver?: TypeConversionResolver
  ): POJObject {
    if (options != null) {
      const schema = this.getObjectSchemaFrom(options)
      if (schema.additionalProperties == null) {
        schema.additionalProperties = { type: JSTypeName.ANY }
      }
      this.applySchemaTo(schema, value, resolver)
    }
    return value
  }
}

export class CreateWrapperObjectAction implements TypeConversionAction<any, POJObject> {
  transform (
    value: any,
    options?: JSONObject
  ): POJObject {
    if (options != null && Array.isArray(options.convert)) {
      const type = getExtendedTypeOf(value)
      if (options.convert.includes(type)) {
        return getObjectFrom(value)
      }
    }
    const key = options?.key != null ? String(options.key) : 'value'
    return { [key]: value }
  }
}

export const DEFAULT_OBJECT_ACTIONS: TypedActionMap<POJObject> = {
  untyped: { ...DEFAULT_UNTYPED_CONVERSIONS },
  conversion: {
    wrap: new CreateWrapperObjectAction()
  },
  typed: {
    modify: new ModifyObjectPropertiesAction(),
    omit: new OmitPropertiesAction(),
    pick: new PickPropertiesAction(),
    set: new SetObjectPropertiesAction()
  }
}

export class ToObjectConvertor extends TypedActionsValueConvertor<POJObject> {
  readonly clone: (value: any) => any
  readonly mutator: ModifyObjectPropertiesAction = new ModifyObjectPropertiesAction()

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
    this.mutator.applySchemaTo(schema, value, resolver)
    return value
  }
}
