import { type TypedValueConvertor } from '../schema/conversions';
import { type BasicJSTypeSchema } from '../schema/JSType';
export declare class ToLiteralConvertor<T> implements TypedValueConvertor<T> {
    readonly value: T;
    constructor(value: T);
    matches(value: unknown): boolean;
    convert(value: unknown): T;
    convertWith(value: unknown): T;
    createJSTypeSchema(): BasicJSTypeSchema;
}
