import { type TypedValueConvertor } from '../schema/conversions'
import { cloneJSON } from '../schema/JSON'

/**
 * Handles conversion of a given value to a variety of types depending on the provided schema.
 * @template T
 * @class
 * @implements {TypedValueConvertor<T>}
 * @property {T} value - fixed value to change any input to
 */
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
