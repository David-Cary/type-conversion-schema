import {
  type TypedValueConvertor,
  type TypeConversionSchema,
  removeTypeConversionActionsFrom
} from '../schema/conversions'
import {
  type BasicJSTypeSchema,
  getExtendedTypeOf
} from '../schema/JSType'
import { cloneJSON } from '../schema/JSON'

export class ToLiteralConvertor<T> implements TypedValueConvertor<T> {
  readonly value: T

  constructor (value: T) {
    this.value = value
  }

  matches (value: unknown): boolean {
    return value === this.value
  }

  convert (value: unknown): T {
    return cloneJSON(this.value)
  }

  convertWith (value: unknown): T {
    return cloneJSON(this.value)
  }

  createJSTypeSchema (
    source?: Partial<TypeConversionSchema>
  ): BasicJSTypeSchema {
    const schema = cloneJSON(source)
    schema.type = getExtendedTypeOf(this.value)
    removeTypeConversionActionsFrom(schema)
    return schema as BasicJSTypeSchema
  }
}
