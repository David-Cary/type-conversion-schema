import { type TypedValueConvertor } from '../schema/conversions';
export declare class ToLiteralConvertor<T> implements TypedValueConvertor<T> {
    readonly value: T;
    constructor(value: T);
    matches(value: unknown): boolean;
    convert(value: unknown): T;
    convertWith(value: unknown): T;
}
