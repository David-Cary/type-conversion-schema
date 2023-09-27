import { type TypeConversionAction, type TypeConversionSchema, type TypeConversionResolver } from '../schema/conversions';
import { type JSONObject } from '../schema/JSON';
import { TypedActionsValueConvertor, type TypedActionMap } from './actions';
/**
 * Converts any non-strings to strings via JSON stringify.
 * @function
 * @param {any} source - value to be converted
 * @returns {string} resulting string
 */
export declare function stringifyValue(source: any): string;
/**
 * Uses JSON stringify to convert a value to a string.
 * @class
 * @implements {TypeConversionAction<unknown, string>}
 */
export declare class StringifyAction implements TypeConversionAction<unknown, string> {
    transform(value: unknown): string;
}
/**
 * Converts the provided value to a number, using the default value if the converted value is invalid.
 * @function
 * @param {any} source - value to be converted
 * @param {number} defaultValue - value to be used if the converted value is not a number
 * @returns {number} converted number
 */
export declare function getNumberWithDefault(source: any, defaultValue?: number): number;
/**
 * Will perform a join on the provided array.  If the target value is not in an array it will simply be stringified.
 * You can specify the separator through the option's 'with' property (defaults to '').
 * @class
 * @implements {TypeConversionAction<unknown, string>}
 */
export declare class JoinTextAction implements TypeConversionAction<unknown, string> {
    transform(value: unknown, options?: JSONObject): string;
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
export declare class PadStringAction implements TypeConversionAction<string> {
    getPaddingText(source: any): string;
    transform(value: string, options?: JSONObject): string;
    expandSchema(schema: Partial<TypeConversionSchema>, options?: JSONObject): void;
}
/**
 * Extracts a subsection of the provided text.
 * The start and end positions of this extraction are taken from the provided options.
 * @class
 * @implements {TypeConversionAction<string>}
 */
export declare class StringSliceAction implements TypeConversionAction<string> {
    transform(value: string, options?: JSONObject): string;
    expandSchema(schema: Partial<TypeConversionSchema>, options?: JSONObject): void;
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
export declare class StringReplaceAction implements TypeConversionAction<string> {
    transform(value: string, options?: JSONObject): string;
}
/**
 * Injects a text segment into the provided string.
 * Both the position and text to be injected are pulled from the provided options of the same name.
 * This defaults to appending the text if no position is provided.
 * @class
 * @implements {TypeConversionAction<string>}
 */
export declare class InsertStringAction implements TypeConversionAction<string> {
    transform(value: string, options?: JSONObject): string;
}
/**
 * Converts the provided text to lower case.
 * This uses 'toLocaleLowerCase' if the 'locale' option is set to true.
 * @class
 * @implements {TypeConversionAction<string>}
 */
export declare class LowerCaseStringAction implements TypeConversionAction<string> {
    transform(value: string, options?: JSONObject): string;
}
/**
 * Converts the provided text to upper case.
 * This uses 'toLocaleUpperCase' if the 'locale' option is set to true.
 * @class
 * @implements {TypeConversionAction<string>}
 */
export declare class UpperCaseStringAction implements TypeConversionAction<string> {
    transform(value: string, options?: JSONObject): string;
}
/**
 * This type of action applies a particular format to the associated string schema.
 * This uses 'toLocaleLowerCase' if the 'locale' option is set to true.
 * @class
 * @implements {TypeConversionAction<string>}
 */
export declare class StringFormatAction implements TypeConversionAction<string> {
    readonly formatName: string;
    constructor(formatName?: string);
    transform(value: string): string;
    expandSchema(schema: Partial<TypeConversionSchema>): void;
}
/**
 * Converts the target value to a date string.
 * If the 'locales' option is set that will be passed into 'toLocaleDateString'.
 * @class
 * @implements {StringFormatAction}
 */
export declare class DateStringAction extends StringFormatAction {
    constructor();
    transform(value: any, options?: JSONObject): string;
}
/**
 * Converts the target value to a time string.
 * If the 'locales' option is set that will be passed into 'toLocaleTimeString'.
 * @class
 * @implements {StringFormatAction}
 */
export declare class TimeStringAction extends StringFormatAction {
    constructor();
    transform(value: any, options?: JSONObject): string;
}
/**
 * Converts the target value to a date and time string.
 * If the 'locales' option is set that will be passed into 'toLocaleString'.
 * @class
 * @implements {StringFormatAction}
 */
export declare class DateTimeStringAction extends StringFormatAction {
    constructor();
    transform(value: any, options?: JSONObject): string;
}
/**
 * Provides default actions for conversions to a string.
 * @const
 */
export declare const DEFAULT_STRING_ACTIONS: TypedActionMap<string>;
/**
 * Handles conversion of a given value to a string.
 * @class
 * @implements {TypedActionsValueConvertor<string>}
 */
export declare class ToStringConvertor extends TypedActionsValueConvertor<string> {
    constructor(actions?: TypedActionMap<string>);
    prepareValue(value: unknown, schema: Partial<TypeConversionSchema>, resolver?: TypeConversionResolver): unknown;
}
