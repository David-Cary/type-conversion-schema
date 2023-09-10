import { type TypeConversionAction, type TypeConversionSchema, type TypeConversionResolver } from '../schema/conversions';
import { type JSONObject } from '../schema/JSON';
import { TypedActionsValueConvertor, type TypedActionMap } from './actions';
/**
 * Callback to be used as the replacer function in JSON stringify calls.
 * @type {Function}
 */
export type StringifyReplacerCallback = (this: any, key: string, value: any) => any;
/**
 * Provides a fallback to failed JSON stringify attempts.
 * @function
 * @param {any} source - value to be converted
 * @param {StringifyReplacerCallback | Array<string | number> | null | undefined} replacer - replacer to pass in to JSON stringify.
 * @param {number | string} space - spacing value to be used by JSON stringify
 * @returns {string} resulting string
 */
export declare function safeJSONStringify(source: any, replacer?: StringifyReplacerCallback | Array<string | number> | null, space?: number | string): string;
export declare function stringifyValue(source: any): string;
/**
 * Uses JSON stringify to convert a value to a string.
 * @class
 * @implements {TypeConversionAction<unknown, string>}
 */
export declare class StringifyAction implements TypeConversionAction<unknown, string> {
    transform(value: unknown): string;
}
export declare function getNumberWithDefault(source: any, defaultValue?: number): number;
export declare class JoinTextAction implements TypeConversionAction<unknown, string> {
    transform(value: unknown, options?: JSONObject): string;
}
export declare class PadStringAction implements TypeConversionAction<string> {
    getPaddingText(source: any): string;
    transform(value: string, options?: JSONObject): string;
    expandSchema(schema: Partial<TypeConversionSchema>, options?: JSONObject): void;
}
export declare class StringSliceAction implements TypeConversionAction<string> {
    transform(value: string, options?: JSONObject): string;
    expandSchema(schema: Partial<TypeConversionSchema>, options?: JSONObject): void;
}
export declare class StringReplaceAction implements TypeConversionAction<string> {
    transform(value: string, options?: JSONObject): string;
}
export declare class InsertStringAction implements TypeConversionAction<string> {
    transform(value: string, options?: JSONObject): string;
}
export declare class LowerCaseStringAction implements TypeConversionAction<string> {
    transform(value: string, options?: JSONObject): string;
}
export declare class UpperCaseStringAction implements TypeConversionAction<string> {
    transform(value: string, options?: JSONObject): string;
}
export declare class StringFormatAction implements TypeConversionAction<string> {
    readonly formatName: string;
    constructor(formatName?: string);
    transform(value: string): string;
    expandSchema(schema: Partial<TypeConversionSchema>): void;
}
export declare class DateStringAction extends StringFormatAction {
    constructor();
    transform(value: any, options?: JSONObject): string;
}
export declare class TimeStringAction extends StringFormatAction {
    constructor();
    transform(value: any, options?: JSONObject): string;
}
export declare class DateTimeStringAction extends StringFormatAction {
    constructor();
    transform(value: any, options?: JSONObject): string;
}
export declare const DEFAULT_STRING_ACTIONS: TypedActionMap<string>;
export declare class ToStringConvertor extends TypedActionsValueConvertor<string> {
    constructor(actions?: TypedActionMap<string>);
    prepareValue(value: unknown, schema: Partial<TypeConversionSchema>, resolver?: TypeConversionResolver): unknown;
}
