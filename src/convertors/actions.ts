import {
  type TypeConversionAction,
  type TypedActionRequest,
  type TypeMarkedObject,
  type TypedValueConvertor,
  type TypeConversionResolver,
  type TypeConversionSchema
} from '../schema/conversions'
import {
  type JSONObject,
  cloneJSON
} from '../schema/JSON'

export class ForceValueAction implements TypeConversionAction {
  transform (
    value: any,
    options?: JSONObject
  ): any {
    return cloneJSON(options?.value)
  }
}

export class DefaultValueAction implements TypeConversionAction {
  transform (
    value: any,
    options?: JSONObject
  ): any {
    return value === undefined ? cloneJSON(options?.value) : value
  }
}

export class GetValueAction implements TypeConversionAction {
  transform (
    value: any,
    options?: JSONObject
  ): any {
    if (typeof value === 'object' && options?.key != null) {
      if (Array.isArray(value)) {
        const index = Number(options.key)
        return value[index]
      }
      const key = String(options.key)
      return (value as Record<string, any>)[key]
    }
  }
}

export function getConversionSchemaFromJSON (source: JSONObject): TypeConversionSchema {
  return {
    type: String(source.type),
    actions: Array.isArray(source.actions)
      ? source.actions.filter(item => {
        switch (typeof item) {
          case 'string': {
            return true
          }
          case 'object': {
            return !Array.isArray(item) && typeof item?.type === 'string'
          }
        }
        return false
      }) as TypedActionRequest[]
      : []
  }
}

export class NestedConversionAction implements TypeConversionAction {
  transform (
    value: any,
    options?: JSONObject,
    resolver?: TypeConversionResolver
  ): any {
    if (resolver != null && options != null) {
      switch (typeof options.to) {
        case 'string': {
          return resolver.convert(value, options.to)
        }
        case 'object': {
          if (options.to != null && !Array.isArray(options.to)) {
            const schema = getConversionSchemaFromJSON(options.to)
            return resolver.convert(value, schema)
          }
          break
        }
      }
    }
    return value
  }
}

export const DEFAULT_UNTYPED_CONVERSIONS = {
  convert: new NestedConversionAction(),
  get: new GetValueAction(),
  setTo: new ForceValueAction()
}

export interface TypedActionMap<T> {
  typed: Record<string, TypeConversionAction<T>>
  untyped: Record<string, TypeConversionAction<any>>
}

export function cloneTypedActionMap<T> (
  source: TypedActionMap<T>
): TypedActionMap<T> {
  return {
    typed: { ...source.typed },
    untyped: { ...source.untyped }
  }
}

export class TypedActionsValueConvertor<T = any> implements TypedValueConvertor<T> {
  readonly typeName: string
  readonly convert: (value: unknown) => T
  readonly actions: TypedActionMap<T>

  constructor (
    typeName: string,
    convert: (value: unknown) => T,
    actions: TypedActionMap<T>
  ) {
    this.typeName = typeName
    this.convert = convert
    this.actions = cloneTypedActionMap(actions)
  }

  getAction (key: string): TypeConversionAction | undefined {
    if (key in this.actions.typed) {
      return this.actions.typed[key]
    }
    return this.actions.untyped[key]
  }

  matches (value: unknown): boolean {
    return (typeof value as string) === this.typeName
  }

  convertWith (
    value: unknown,
    actions: TypedActionRequest[],
    resolver?: TypeConversionResolver
  ): T {
    let untypedResult = value
    const skippedRequests: TypeMarkedObject[] = []
    for (const request of actions) {
      const expandedRequest = this.expandActionRequest(request)
      const action = this.actions.untyped[expandedRequest.type]
      if (action != null) {
        untypedResult = action.transform(
          untypedResult,
          expandedRequest,
          resolver
        )
      } else {
        skippedRequests.push(expandedRequest)
      }
    }
    let typedResult = this.convert(untypedResult)
    for (const request of skippedRequests) {
      const action = this.actions.typed[request.type]
      if (action != null) {
        typedResult = action.transform(
          typedResult,
          request,
          resolver
        )
      }
    }
    return typedResult
  }

  expandActionRequest (source: TypedActionRequest): TypeMarkedObject {
    if (typeof source === 'object') {
      return source
    }
    return {
      type: source
    }
  }
}
