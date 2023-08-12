"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToStringConvertor = exports.DEFAULT_STRING_ACTIONS = exports.DateTimeStringAction = exports.TimeStringAction = exports.DateStringAction = exports.StringFormatAction = exports.UpperCaseStringAction = exports.LowerCaseStringAction = exports.InsertStringAction = exports.StringReplaceAction = exports.StringSliceAction = exports.PadStringAction = exports.JoinTextAction = exports.StringifyAction = exports.stringifyValue = exports.safeJSONStringify = void 0;
const number_1 = require("./number");
const actions_1 = require("./actions");
function safeJSONStringify(source, replacer, space) {
    try {
        if (typeof replacer === 'function') {
            return JSON.stringify(source, replacer, space);
        }
        return JSON.stringify(source, replacer, space);
    }
    catch (error) {
        return String(source);
    }
}
exports.safeJSONStringify = safeJSONStringify;
function stringifyValue(source) {
    return typeof source === 'string' ? source : safeJSONStringify(source);
}
exports.stringifyValue = stringifyValue;
class StringifyAction {
    transform(value) {
        return safeJSONStringify(value);
    }
}
exports.StringifyAction = StringifyAction;
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
class PadStringAction {
    getPaddingText(source) {
        if (source == null)
            return ' ';
        const text = String(source);
        return text.length > 0 ? text : ' ';
    }
    transform(value, options) {
        const text = this.getPaddingText(options?.text);
        const length = (0, number_1.getNumberWithDefault)(options?.length, 0);
        const atStart = Boolean(options?.atStart);
        return atStart ? value.padStart(length, text) : value.padEnd(length, text);
    }
    modifySchema(schema, options) {
        if (typeof schema === 'object') {
            const length = (0, number_1.getNumberWithDefault)(options?.length, 0);
            if (schema.minLength === undefined || schema.minLength < length) {
                schema.minLength = length;
            }
        }
    }
}
exports.PadStringAction = PadStringAction;
class StringSliceAction {
    transform(value, options) {
        const start = (0, number_1.getNumberWithDefault)(options?.start, 0);
        const end = Number(options?.end);
        return value.slice(start, end);
    }
    modifySchema(schema, options) {
        if (typeof schema === 'object') {
            const end = Number(options?.end);
            if (!isNaN(end)) {
                const start = (0, number_1.getNumberWithDefault)(options?.start, 0);
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
class LowerCaseStringAction {
    transform(value, options) {
        const useLocale = Boolean(options?.locale);
        return useLocale
            ? value.toLowerCase()
            : value.toLocaleLowerCase();
    }
}
exports.LowerCaseStringAction = LowerCaseStringAction;
class UpperCaseStringAction {
    transform(value, options) {
        const useLocale = Boolean(options?.locale);
        return useLocale
            ? value.toUpperCase()
            : value.toLocaleUpperCase();
    }
}
exports.UpperCaseStringAction = UpperCaseStringAction;
class StringFormatAction {
    constructor(formatName = '') {
        this.formatName = formatName;
    }
    transform(value) {
        return value;
    }
    modifySchema(schema, options) {
        if (typeof schema === 'object') {
            schema.format = this.formatName;
        }
    }
}
exports.StringFormatAction = StringFormatAction;
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
exports.DEFAULT_STRING_ACTIONS = {
    untyped: {
        convert: new actions_1.NestedConversionAction(),
        date: new DateStringAction(),
        dateTime: new DateTimeStringAction(),
        default: new actions_1.DefaultValueAction(),
        join: new JoinTextAction(),
        setTo: new actions_1.ForceValueAction(),
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
class ToStringConvertor extends actions_1.TypedActionsValueConvertor {
    constructor(actions = exports.DEFAULT_STRING_ACTIONS) {
        super('string', String, actions);
    }
}
exports.ToStringConvertor = ToStringConvertor;
