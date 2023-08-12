import {
  type TypeConversionAction,
  type TypedActionRequest,
  type TypeMarkedObject,
  type TypedValueConvertor,
  type JSONObject
} from '../schema/conversions'
import { cloneJSON } from './literal'

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

export interface TypedActionMap<T> {
  typed: Record<string, TypeConversionAction<T>>
  untyped: Record<string, TypeConversionAction<any>>
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
    this.actions = {
      typed: { ...actions.typed },
      untyped: { ...actions.untyped }
    }
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
    actions: TypedActionRequest[]
  ): T {
    let untypedResult = value
    const skippedRequests: TypeMarkedObject[] = []
    for (const request of actions) {
      const expandedRequest = this.expandActionRequest(request)
      const action = this.actions.untyped[expandedRequest.type]
      if (action != null) {
        untypedResult = action.transform(untypedResult, expandedRequest)
      } else {
        skippedRequests.push(expandedRequest)
      }
    }
    let typedResult = this.convert(untypedResult)
    for (const request of skippedRequests) {
      const action = this.actions.typed[request.type]
      if (action != null) {
        typedResult = action.transform(typedResult, request)
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
