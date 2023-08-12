import { type TypedValueConvertor, type TypeConversionAction } from '../schema/conversions';
export declare function cloneJSON(source: any): any;
export declare class ToLiteralConvertor<T> implements TypedValueConvertor<T> {
    readonly value: T;
    constructor(value: T);
    getAction(key: string): TypeConversionAction | undefined;
    matches(value: unknown): boolean;
    convert(value: unknown): T;
    convertWith(value: unknown): T;
}
