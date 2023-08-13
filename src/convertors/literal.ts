import {
  type TypedValueConvertor,
  type TypeConversionAction
} from '../schema/conversions'
import { cloneJSON } from '../schema/JSON'

export class ToLiteralConvertor<T> implements TypedValueConvertor<T> {
  readonly value: T

  constructor (value: T) {
    this.value = value
  }

  getAction (key: string): TypeConversionAction | undefined {
    return undefined
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
