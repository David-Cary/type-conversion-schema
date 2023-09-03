import { type TypedValueConvertor } from '../schema/conversions'
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
}
