import { type TypedValueConvertor } from '../schema/conversions';
/**
 * Handles conversion of a given value to a variety of types depending on the provided schema.
 * @template T
 * @class
 * @implements {TypedValueConvertor<T>}
 * @property {T} value - fixed value to change any input to
 */
export declare class ToLiteralConvertor<T> implements TypedValueConvertor<T> {
    readonly value: T;
    constructor(value: T);
    matches(value: unknown): boolean;
    convert(value: unknown): T;
    convertWith(value: unknown): T;
}
