import {
  type TypedValueConvertor,
  type TypeConversionAction
} from '../schema/conversions'

export function cloneJSON (source: any): any {
  if (typeof source === 'object' && source != null) {
    if (Array.isArray(source)) {
      return source.map(item => cloneJSON(item))
    }
    const result: Record<string, any> = {}
    const values = source as Record<string, any>
    for (const key in values) {
      result[key] = cloneJSON(values[key])
    }
    return result
  }
  return source
}

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
