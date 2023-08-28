import {
  type TypeConversionAction,
  type TypeConversionSchema,
  type TypeConversionResolver
} from '../schema/conversions'
import { cloneJSON } from '../schema/JSON'
import {
  TypedActionsValueConvertor,
  type TypedActionMap,
  DEFAULT_UNTYPED_CONVERSIONS
} from './actions'

export class ToAnyConvertor extends TypedActionsValueConvertor<any> {
  constructor (
    actions: Record<string, TypeConversionAction<any>> = DEFAULT_UNTYPED_CONVERSIONS
  ) {
    const actionMap: TypedActionMap<any> = {
      typed: actions,
      untyped: actions,
      conversion: actions
    }
    super('any', (value: any) => value, actionMap)
  }

  finalizeValue (
    value: unknown,
    schema: Partial<TypeConversionSchema>,
    resolver?: TypeConversionResolver
  ): unknown {
    value = super.finalizeValue(value, schema, resolver)
    if ('const' in schema) {
      return cloneJSON(schema.const)
    }
    if (value === undefined && 'default' in schema) {
      return cloneJSON(schema.default)
    }
    return value
  }
}
