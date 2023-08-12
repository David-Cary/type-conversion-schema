import {
  type TypeConversionAction,
  type JSONObject
} from '../schema/conversions'
import { getNumberWithDefault } from './number'
import {
  TypedActionsValueConvertor,
  type TypedActionMap,
  DefaultValueAction,
  ForceValueAction
} from './actions'
import { type JSONSchema } from 'json-schema-typed'

export function safeJSONStringify (source: any): string {
  try {
    return JSON.stringify(source)
  } catch (error) {
    return String(source)
  }
}

export class StringifyAction implements TypeConversionAction<unknown, string> {
  transform (
    value: unknown,
    options?: JSONObject
  ): string {
    return safeJSONStringify(value)
  }
}

export class JoinTextAction implements TypeConversionAction<unknown, string> {
  transform (
    value: unknown,
    options?: JSONObject
  ): string {
    if (Array.isArray(value)) {
      const separator = options?.with != null ? String(options.with) : ''
      return value.join(separator)
    }
    return safeJSONStringify(value)
  }
}

export class PadStringAction implements TypeConversionAction<string> {
  getPaddingText (source: any): string {
    const text = String(source)
    return text.length > 0 ? text : ' '
  }

  transform (
    value: string,
    options?: JSONObject
  ): string {
    const text = this.getPaddingText(options?.text)
    const length = getNumberWithDefault(options?.length, 0)
    const append = Boolean(options?.append)
    return append ? value.padEnd(length, text) : value.padStart(length, text)
  }

  modifySchema (
    schema: JSONSchema,
    options?: JSONObject
  ): void {
    if (typeof schema === 'object') {
      const length = getNumberWithDefault(options?.length, 0)
      if (schema.minLength === undefined || schema.minLength < length) {
        schema.minLength = length
      }
    }
  }
}

export class StringSliceAction implements TypeConversionAction<string> {
  transform (
    value: string,
    options?: JSONObject
  ): string {
    const start = getNumberWithDefault(options?.start, 0)
    const end = Number(options?.end)
    return value.slice(start, end)
  }

  modifySchema (
    schema: JSONSchema,
    options?: JSONObject
  ): void {
    if (typeof schema === 'object') {
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

export class InsertStringAction implements TypeConversionAction<string> {
  transform (
    value: string,
    options?: JSONObject
  ): string {
    if (options != null) {
      const text = safeJSONStringify(options.text)
      const position = Number(options.position)
      if (isNaN(position)) {
        return value + text
      }
      const prefix = value.substring(0, position)
      const suffix = value.substring(position)
      return prefix + text + suffix
    }
    return value
  }
}

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

export class StringFormatAction implements TypeConversionAction<string> {
  readonly formatName: string

  constructor (formatName: string = '') {
    this.formatName = formatName
  }

  transform (
    value: string,
    options?: JSONObject
  ): string {
    return value
  }

  modifySchema (
    schema: JSONSchema,
    options?: JSONObject
  ): void {
    if (typeof schema === 'object') {
      schema.format = this.formatName
    }
  }
}

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
      const locales = String(options.locale)
      return date.toLocaleDateString(locales, options)
    }
    return date.toLocaleDateString()
  }
}

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
      const locales = String(options.locale)
      return date.toLocaleTimeString(locales, options)
    }
    return date.toLocaleTimeString()
  }
}

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
      const locales = String(options.locale)
      return date.toLocaleString(locales, options)
    }
    return date.toLocaleString()
  }
}

export const DEFAULT_STRING_ACTIONS: TypedActionMap<string> = {
  untyped: {
    date: new DateStringAction(),
    dateTime: new DateTimeStringAction(),
    default: new DefaultValueAction(),
    join: new JoinTextAction(),
    setTo: new ForceValueAction(),
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

export class ToStringConvertor extends TypedActionsValueConvertor<string> {
  constructor (
    actions: TypedActionMap<string> = DEFAULT_STRING_ACTIONS
  ) {
    super('string', String, actions)
  }
}
