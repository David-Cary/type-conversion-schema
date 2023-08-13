export type JSONType =
  | string
  | number
  | boolean
  | null
  | { [key: string]: JSONType }
  | JSONType[]

export type JSONObject = Record<string, JSONType>

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
