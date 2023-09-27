import {
  type TypeConversionAction,
  type TypeConversionSchema,
  type TypeConversionResolver,
  safeJSONStringify
} from '../schema/conversions'
import { type JSONObject } from '../schema/JSON'
import {
  TypedActionsValueConvertor,
  type TypedActionMap,
  DEFAULT_UNTYPED_CONVERSIONS
} from './actions'

/**
 * Converts any non-strings to strings via JSON stringify.
 * @function
 * @param {any} source - value to be converted
 * @returns {string} resulting string
 */
export function stringifyValue (source: any): string {
  return typeof source === 'string' ? source : safeJSONStringify(source)
}

/**
 * Uses JSON stringify to convert a value to a string.
 * @class
 * @implements {TypeConversionAction<unknown, string>}
 */
export class StringifyAction implements TypeConversionAction<unknown, string> {
  transform (value: unknown): string {
    return safeJSONStringify(value)
  }
}

/**
 * Converts the provided value to a number, using the default value if the converted value is invalid.
 * @function
 * @param {any} source - value to be converted
 * @param {number} defaultValue - value to be used if the converted value is not a number
 * @returns {number} converted number
 */
export function getNumberWithDefault (
  source: any,
  defaultValue: number = 0
): number {
  const converted = Number(source)
  return isNaN(converted) ? defaultValue : converted
}

/**
 * Will perform a join on the provided array.  If the target value is not in an array it will simply be stringified.
 * You can specify the separator through the option's 'with' property (defaults to '').
 * @class
 * @implements {TypeConversionAction<unknown, string>}
 */
export class JoinTextAction implements TypeConversionAction<unknown, string> {
  transform (
    value: unknown,
    options?: JSONObject
  ): string {
    if (Array.isArray(value)) {
      const separator = options?.with != null ? String(options.with) : ''
      return value.join(separator)
    }
    return stringifyValue(value)
  }
}

/**
 * Adds characters to a string to reach the desired length.
 * That length is drawn from the provided option's 'length' property.
 * The padding character is drawn from the option's 'text' property, defaulting to ' '.
 * If 'atStart' is set in options, the padding will be applied to the start of the string.
 * Otherwise, it will be attached to the end of the string instead.
 * @class
 * @implements {TypeConversionAction<string>}
 */
export class PadStringAction implements TypeConversionAction<string> {
  getPaddingText (source: any): string {
    if (source == null) return ' '
    const text = String(source)
    return text.length > 0 ? text : ' '
  }

  transform (
    value: string,
    options?: JSONObject
  ): string {
    const text = this.getPaddingText(options?.text)
    const length = getNumberWithDefault(options?.length, 0)
    const atStart = Boolean(options?.atStart)
    return atStart ? value.padStart(length, text) : value.padEnd(length, text)
  }

  expandSchema (
    schema: Partial<TypeConversionSchema>,
    options?: JSONObject
  ): void {
    const length = getNumberWithDefault(options?.length, 0)
    if (schema.type === 'string') {
      if (schema.minLength === undefined || schema.minLength < length) {
        schema.minLength = length
      }
    }
  }
}

/**
 * Extracts a subsection of the provided text.
 * The start and end positions of this extraction are taken from the provided options.
 * @class
 * @implements {TypeConversionAction<string>}
 */
export class StringSliceAction implements TypeConversionAction<string> {
  transform (
    value: string,
    options?: JSONObject
  ): string {
    const start = getNumberWithDefault(options?.start, 0)
    const end = Number(options?.end)
    return value.slice(start, end)
  }

  expandSchema (
    schema: Partial<TypeConversionSchema>,
    options?: JSONObject
  ): void {
    if (schema.type === 'string') {
      const end = Number(options?.end)
      if (!isNaN(end)) {
        const start = getNumberWithDefault(options?.start, 0)
        const sameSign = start >= 0
          ? end >= 0
          : end < 0
        if (sameSign) {
          schema.maxLength = Math.max(0, end - start)
        }
      }
    }
  }
}

/**
 * Returns a string that replaces specified subsections of the target text with other text.
 * This requires 'pattern' and 'replacement' strings in the provided options.
 * If 'useRegEx' in set to true, that pattern will be evaluated as a regular expression.
 * You can also specify the flags for this regular expression using an option of the same name.
 * If the 'all' option is set to true this will replace all instances of the target text.
 * @class
 * @implements {TypeConversionAction<string>}
 */
export class StringReplaceAction implements TypeConversionAction<string> {
  transform (
    value: string,
    options?: JSONObject
  ): string {
    if (options?.pattern != null && options.replacement != null) {
      let pattern: RegExp | string = String(options.pattern)
      const useRegEx = Boolean(options.regex)
      if (useRegEx) {
        if (options.flags != null) {
          const flags = String(options.flags)
          pattern = new RegExp(pattern, flags)
        } else {
          pattern = new RegExp(pattern)
        }
      }
      const replacement = String(options.replacement)
      const replaceAll = Boolean(options.all)
      return replaceAll
        ? value.replaceAll(pattern, replacement)
        : value.replace(pattern, replacement)
    }
    return value
  }
}

/**
 * Injects a text segment into the provided string.
 * Both the position and text to be injected are pulled from the provided options of the same name.
 * This defaults to appending the text if no position is provided.
 * @class
 * @implements {TypeConversionAction<string>}
 */
export class InsertStringAction implements TypeConversionAction<string> {
  transform (
    value: string,
    options?: JSONObject
  ): string {
    if (options != null) {
      const text = stringifyValue(options.text)
      const position = Number(options.position)
      if (isNaN(position)) {
        return value + text
      }
      const prefix = value.slice(0, position)
      const suffix = value.slice(position)
      return prefix + text + suffix
    }
    return value
  }
}

/**
 * Converts the provided text to lower case.
 * This uses 'toLocaleLowerCase' if the 'locale' option is set to true.
 * @class
 * @implements {TypeConversionAction<string>}
 */
export class LowerCaseStringAction implements TypeConversionAction<string> {
  transform (
    value: string,
    options?: JSONObject
  ): string {
    const useLocale = Boolean(options?.locale)
    return useLocale
      ? value.toLowerCase()
      : value.toLocaleLowerCase()
  }
}

/**
 * Converts the provided text to upper case.
 * This uses 'toLocaleUpperCase' if the 'locale' option is set to true.
 * @class
 * @implements {TypeConversionAction<string>}
 */
export class UpperCaseStringAction implements TypeConversionAction<string> {
  transform (
    value: string,
    options?: JSONObject
  ): string {
    const useLocale = Boolean(options?.locale)
    return useLocale
      ? value.toUpperCase()
      : value.toLocaleUpperCase()
  }
}

/**
 * This type of action applies a particular format to the associated string schema.
 * This uses 'toLocaleLowerCase' if the 'locale' option is set to true.
 * @class
 * @implements {TypeConversionAction<string>}
 */
export class StringFormatAction implements TypeConversionAction<string> {
  readonly formatName: string

  constructor (formatName: string = '') {
    this.formatName = formatName
  }

  transform (value: string): string {
    return value
  }

  expandSchema (
    schema: Partial<TypeConversionSchema>
  ): void {
    if (schema.type === 'string') {
      schema.format = this.formatName
    }
  }
}

/**
 * Converts the target value to a date string.
 * If the 'locales' option is set that will be passed into 'toLocaleDateString'.
 * @class
 * @implements {StringFormatAction}
 */
export class DateStringAction extends StringFormatAction {
  constructor () {
    super('date')
  }

  transform (
    value: any,
    options?: JSONObject
  ): string {
    const date = new Date(value)
    if (options?.locales != null) {
      const locales = String(options.locales)
      return date.toLocaleDateString(locales, options)
    }
    return date.toLocaleDateString()
  }
}

/**
 * Converts the target value to a time string.
 * If the 'locales' option is set that will be passed into 'toLocaleTimeString'.
 * @class
 * @implements {StringFormatAction}
 */
export class TimeStringAction extends StringFormatAction {
  constructor () {
    super('time')
  }

  transform (
    value: any,
    options?: JSONObject
  ): string {
    const date = new Date(value)
    if (options?.locales != null) {
      const locales = String(options.locales)
      return date.toLocaleTimeString(locales, options)
    }
    return date.toLocaleTimeString()
  }
}

/**
 * Converts the target value to a date and time string.
 * If the 'locales' option is set that will be passed into 'toLocaleString'.
 * @class
 * @implements {StringFormatAction}
 */
export class DateTimeStringAction extends StringFormatAction {
  constructor () {
    super('date-time')
  }

  transform (
    value: any,
    options?: JSONObject
  ): string {
    const date = new Date(value)
    if (options?.locales != null) {
      const locales = String(options.locales)
      return date.toLocaleString(locales, options)
    }
    return date.toLocaleString()
  }
}

/**
 * Provides default actions for conversions to a string.
 * @const
 */
export const DEFAULT_STRING_ACTIONS: TypedActionMap<string> = {
  untyped: { ...DEFAULT_UNTYPED_CONVERSIONS },
  conversion: {
    date: new DateStringAction(),
    dateTime: new DateTimeStringAction(),
    join: new JoinTextAction(),
    stringify: new StringifyAction(),
    time: new TimeStringAction()
  },
  typed: {
    insert: new InsertStringAction(),
    lowerCase: new LowerCaseStringAction(),
    pad: new PadStringAction(),
    replace: new StringReplaceAction(),
    slice: new StringSliceAction(),
    upperCase: new UpperCaseStringAction()
  }
}

/**
 * Handles conversion of a given value to a string.
 * @class
 * @implements {TypedActionsValueConvertor<string>}
 */
export class ToStringConvertor extends TypedActionsValueConvertor<string> {
  constructor (
    actions: TypedActionMap<string> = DEFAULT_STRING_ACTIONS
  ) {
    super('string', String, actions)
  }

  prepareValue (
    value: unknown,
    schema: Partial<TypeConversionSchema>,
    resolver?: TypeConversionResolver
  ): unknown {
    if ('const' in schema && typeof schema.const === 'string') {
      return schema.const
    }
    value = super.prepareValue(value, schema, resolver)
    if (
      value === undefined &&
      'default' in schema &&
      typeof schema.default === 'string'
    ) {
      return schema.default
    }
    return value
  }
}
