import { type TypeConversionAction, type TypeConversionSchema, type TypeConversionResolver } from '../schema/conversions';
import { type JSONObject } from '../schema/JSON';
import { TypedActionsValueConvertor, type TypedActionMap } from './actions';
export declare function getBigIntFrom(value: any, defaultValue?: bigint): bigint;
export declare class PositiveBigIntAction implements TypeConversionAction<bigint> {
    transform(value: bigint): bigint;
    expandSchema(schema: Partial<TypeConversionSchema>, options?: JSONObject): void;
}
export declare class NegativeBigIntAction implements TypeConversionAction<bigint> {
    transform(value: bigint): bigint;
    expandSchema(schema: Partial<TypeConversionSchema>, options?: JSONObject): void;
}
export declare const DEFAULT_BIG_INT_ACTIONS: TypedActionMap<bigint>;
export declare class ToBigIntConvertor extends TypedActionsValueConvertor<bigint> {
    constructor(actions?: TypedActionMap<bigint>);
    prepareValue(value: unknown, schema: Partial<TypeConversionSchema>, resolver?: TypeConversionResolver): unknown;
    finalizeValue(value: bigint, schema: Partial<TypeConversionSchema>, resolver?: TypeConversionResolver): bigint;
    enforceRange(value: bigint, schema: Partial<TypeConversionSchema>): bigint;
    finalizeSchema(schema: Partial<TypeConversionSchema>, resolver?: TypeConversionResolver): void;
}
