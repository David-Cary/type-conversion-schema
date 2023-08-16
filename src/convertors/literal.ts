import { type TypedValueConvertor } from '../schema/conversions'
import {
  type BasicJSTypeSchema,
  type VariedJSTypeSchema,
  getExtendedTypeOf,
  createBasicSchema
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

  createJSTypeSchema (): BasicJSTypeSchema {
    const type = getExtendedTypeOf(this.value)
    const schema = createBasicSchema(type)
    if (this.value != null) {
      const typed = schema as VariedJSTypeSchema<T>
      typed.const = cloneJSON(this.value)
    }
    return schema
  }
}
