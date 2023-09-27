"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToStringConvertor = exports.DEFAULT_STRING_ACTIONS = exports.DateTimeStringAction = exports.TimeStringAction = exports.DateStringAction = exports.StringFormatAction = exports.UpperCaseStringAction = exports.LowerCaseStringAction = exports.InsertStringAction = exports.StringReplaceAction = exports.StringSliceAction = exports.PadStringAction = exports.JoinTextAction = exports.getNumberWithDefault = exports.StringifyAction = exports.stringifyValue = void 0;
const conversions_1 = require("../schema/conversions");
const actions_1 = require("./actions");
/**
 * Converts any non-strings to strings via JSON stringify.
 * @function
 * @param {any} source - value to be converted
 * @returns {string} resulting string
 */
function stringifyValue(source) {
    return typeof source === 'string' ? source : (0, conversions_1.safeJSONStringify)(source);
}
exports.stringifyValue = stringifyValue;
/**
 * Uses JSON stringify to convert a value to a string.
 * @class
 * @implements {TypeConversionAction<unknown, string>}
 */
class StringifyAction {
    transform(value) {
        return (0, conversions_1.safeJSONStringify)(value);
    }
}
exports.StringifyAction = StringifyAction;
/**
 * Converts the provided value to a number, using the default value if the converted value is invalid.
 * @function
 * @param {any} source - value to be converted
 * @param {number} defaultValue - value to be used if the converted value is not a number
 * @returns {number} converted number
 */
function getNumberWithDefault(source, defaultValue = 0) {
    const converted = Number(source);
    return isNaN(converted) ? defaultValue : converted;
}
exports.getNumberWithDefault = getNumberWithDefault;
/**
 * Will perform a join on the provided array.  If the target value is not in an array it will simply be stringified.
 * You can specify the separator through the option's 'with' property (defaults to '').
 * @class
 * @implements {TypeConversionAction<unknown, string>}
 */
class JoinTextAction {
    transform(value, options) {
        if (Array.isArray(value)) {
            const separator = options?.with != null ? String(options.with) : '';
            return value.join(separator);
        }
        return stringifyValue(value);
    }
}
exports.JoinTextAction = JoinTextAction;
/**
 * Adds characters to a string to reach the desired length.
 * That length is drawn from the provided option's 'length' property.
 * The padding character is drawn from the option's 'text' property, defaulting to ' '.
 * If 'atStart' is set in options, the padding will be applied to the start of the string.
 * Otherwise, it will be attached to the end of the string instead.
 * @class
 * @implements {TypeConversionAction<string>}
 */
class PadStringAction {
    getPaddingText(source) {
        if (source == null)
            return ' ';
        const text = String(source);
        return text.length > 0 ? text : ' ';
    }
    transform(value, options) {
        const text = this.getPaddingText(options?.text);
        const length = getNumberWithDefault(options?.length, 0);
        const atStart = Boolean(options?.atStart);
        return atStart ? value.padStart(length, text) : value.padEnd(length, text);
    }
    expandSchema(schema, options) {
        const length = getNumberWithDefault(options?.length, 0);
        if (schema.type === 'string') {
            if (schema.minLength === undefined || schema.minLength < length) {
                schema.minLength = length;
            }
        }
    }
}
exports.PadStringAction = PadStringAction;
/**
 * Extracts a subsection of the provided text.
 * The start and end positions of this extraction are taken from the provided options.
 * @class
 * @implements {TypeConversionAction<string>}
 */
class StringSliceAction {
    transform(value, options) {
        const start = getNumberWithDefault(options?.start, 0);
        const end = Number(options?.end);
        return value.slice(start, end);
    }
    expandSchema(schema, options) {
        if (schema.type === 'string') {
            const end = Number(options?.end);
            if (!isNaN(end)) {
                const start = getNumberWithDefault(options?.start, 0);
                const sameSign = start >= 0
                    ? end >= 0
                    : end < 0;
                if (sameSign) {
                    schema.maxLength = Math.max(0, end - start);
                }
            }
        }
    }
}
exports.StringSliceAction = StringSliceAction;
/**
 * Returns a string that replaces specified subsections of the target text with other text.
 * This requires 'pattern' and 'replacement' strings in the provided options.
 * If 'useRegEx' in set to true, that pattern will be evaluated as a regular expression.
 * You can also specify the flags for this regular expression using an option of the same name.
 * If the 'all' option is set to true this will replace all instances of the target text.
 * @class
 * @implements {TypeConversionAction<string>}
 */
class StringReplaceAction {
    transform(value, options) {
        if (options?.pattern != null && options.replacement != null) {
            let pattern = String(options.pattern);
            const useRegEx = Boolean(options.regex);
            if (useRegEx) {
                if (options.flags != null) {
                    const flags = String(options.flags);
                    pattern = new RegExp(pattern, flags);
                }
                else {
                    pattern = new RegExp(pattern);
                }
            }
            const replacement = String(options.replacement);
            const replaceAll = Boolean(options.all);
            return replaceAll
                ? value.replaceAll(pattern, replacement)
                : value.replace(pattern, replacement);
        }
        return value;
    }
}
exports.StringReplaceAction = StringReplaceAction;
/**
 * Injects a text segment into the provided string.
 * Both the position and text to be injected are pulled from the provided options of the same name.
 * This defaults to appending the text if no position is provided.
 * @class
 * @implements {TypeConversionAction<string>}
 */
class InsertStringAction {
    transform(value, options) {
        if (options != null) {
            const text = stringifyValue(options.text);
            const position = Number(options.position);
            if (isNaN(position)) {
                return value + text;
            }
            const prefix = value.slice(0, position);
            const suffix = value.slice(position);
            return prefix + text + suffix;
        }
        return value;
    }
}
exports.InsertStringAction = InsertStringAction;
/**
 * Converts the provided text to lower case.
 * This uses 'toLocaleLowerCase' if the 'locale' option is set to true.
 * @class
 * @implements {TypeConversionAction<string>}
 */
class LowerCaseStringAction {
    transform(value, options) {
        const useLocale = Boolean(options?.locale);
        return useLocale
            ? value.toLowerCase()
            : value.toLocaleLowerCase();
    }
}
exports.LowerCaseStringAction = LowerCaseStringAction;
/**
 * Converts the provided text to upper case.
 * This uses 'toLocaleUpperCase' if the 'locale' option is set to true.
 * @class
 * @implements {TypeConversionAction<string>}
 */
class UpperCaseStringAction {
    transform(value, options) {
        const useLocale = Boolean(options?.locale);
        return useLocale
            ? value.toUpperCase()
            : value.toLocaleUpperCase();
    }
}
exports.UpperCaseStringAction = UpperCaseStringAction;
/**
 * This type of action applies a particular format to the associated string schema.
 * This uses 'toLocaleLowerCase' if the 'locale' option is set to true.
 * @class
 * @implements {TypeConversionAction<string>}
 */
class StringFormatAction {
    constructor(formatName = '') {
        this.formatName = formatName;
    }
    transform(value) {
        return value;
    }
    expandSchema(schema) {
        if (schema.type === 'string') {
            schema.format = this.formatName;
        }
    }
}
exports.StringFormatAction = StringFormatAction;
/**
 * Converts the target value to a date string.
 * If the 'locales' option is set that will be passed into 'toLocaleDateString'.
 * @class
 * @implements {StringFormatAction}
 */
class DateStringAction extends StringFormatAction {
    constructor() {
        super('date');
    }
    transform(value, options) {
        const date = new Date(value);
        if (options?.locales != null) {
            const locales = String(options.locales);
            return date.toLocaleDateString(locales, options);
        }
        return date.toLocaleDateString();
    }
}
exports.DateStringAction = DateStringAction;
/**
 * Converts the target value to a time string.
 * If the 'locales' option is set that will be passed into 'toLocaleTimeString'.
 * @class
 * @implements {StringFormatAction}
 */
class TimeStringAction extends StringFormatAction {
    constructor() {
        super('time');
    }
    transform(value, options) {
        const date = new Date(value);
        if (options?.locales != null) {
            const locales = String(options.locales);
            return date.toLocaleTimeString(locales, options);
        }
        return date.toLocaleTimeString();
    }
}
exports.TimeStringAction = TimeStringAction;
/**
 * Converts the target value to a date and time string.
 * If the 'locales' option is set that will be passed into 'toLocaleString'.
 * @class
 * @implements {StringFormatAction}
 */
class DateTimeStringAction extends StringFormatAction {
    constructor() {
        super('date-time');
    }
    transform(value, options) {
        const date = new Date(value);
        if (options?.locales != null) {
            const locales = String(options.locales);
            return date.toLocaleString(locales, options);
        }
        return date.toLocaleString();
    }
}
exports.DateTimeStringAction = DateTimeStringAction;
/**
 * Provides default actions for conversions to a string.
 * @const
 */
exports.DEFAULT_STRING_ACTIONS = {
    untyped: { ...actions_1.DEFAULT_UNTYPED_CONVERSIONS },
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
};
/**
 * Handles conversion of a given value to a string.
 * @class
 * @implements {TypedActionsValueConvertor<string>}
 */
class ToStringConvertor extends actions_1.TypedActionsValueConvertor {
    constructor(actions = exports.DEFAULT_STRING_ACTIONS) {
        super('string', String, actions);
    }
    prepareValue(value, schema, resolver) {
        if ('const' in schema && typeof schema.const === 'string') {
            return schema.const;
        }
        value = super.prepareValue(value, schema, resolver);
        if (value === undefined &&
            'default' in schema &&
            typeof schema.default === 'string') {
            return schema.default;
        }
        return value;
    }
}
exports.ToStringConvertor = ToStringConvertor;
