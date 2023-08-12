import { type TypeConversionAction, type JSONObject } from '../schema/conversions';
import { TypedActionsValueConvertor, type TypedActionMap } from './actions';
import { type JSONSchema } from 'json-schema-typed';
export type StringifyReplacerCallback = (this: any, key: string, value: any) => any;
export declare function safeJSONStringify(source: any, replacer?: StringifyReplacerCallback | Array<string | number> | null, space?: number | string): string;
export declare function stringifyValue(source: any): string;
export declare class StringifyAction implements TypeConversionAction<unknown, string> {
    transform(value: unknown): string;
}
export declare class JoinTextAction implements TypeConversionAction<unknown, string> {
    transform(value: unknown, options?: JSONObject): string;
}
export declare class PadStringAction implements TypeConversionAction<string> {
    getPaddingText(source: any): string;
    transform(value: string, options?: JSONObject): string;
    modifySchema(schema: JSONSchema, options?: JSONObject): void;
}
export declare class StringSliceAction implements TypeConversionAction<string> {
    transform(value: string, options?: JSONObject): string;
    modifySchema(schema: JSONSchema, options?: JSONObject): void;
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
    modifySchema(schema: JSONSchema, options?: JSONObject): void;
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
}
