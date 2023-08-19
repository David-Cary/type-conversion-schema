import { type TypeConversionAction } from '../schema/conversions';
import { type JSONObject } from '../schema/JSON';
import { TypedActionsValueConvertor, type TypedActionMap } from './actions';
import { type BasicJSTypeSchema } from '../schema/JSType';
export declare function getBigIntFrom(value: any, defaultValue?: bigint): bigint;
export declare class BigIntToMultipleOfAction implements TypeConversionAction<bigint> {
    transform(value: bigint, options?: JSONObject): bigint;
    modifySchema(schema: BasicJSTypeSchema, options?: JSONObject): BasicJSTypeSchema;
}
export declare class MinimumBigIntAction implements TypeConversionAction<bigint> {
    transform(value: bigint, options?: JSONObject): bigint;
    modifySchema(schema: BasicJSTypeSchema, options?: JSONObject): BasicJSTypeSchema;
}
export declare class MaximumBigIntAction implements TypeConversionAction<bigint> {
    transform(value: bigint, options?: JSONObject): bigint;
    modifySchema(schema: BasicJSTypeSchema, options?: JSONObject): BasicJSTypeSchema;
}
export declare class PositiveBigIntAction implements TypeConversionAction<bigint> {
    transform(value: bigint): bigint;
    modifySchema(schema: BasicJSTypeSchema, options?: JSONObject): BasicJSTypeSchema;
}
export declare class NegativeBigIntAction implements TypeConversionAction<bigint> {
    transform(value: bigint): bigint;
    modifySchema(schema: BasicJSTypeSchema, options?: JSONObject): BasicJSTypeSchema;
}
export declare const DEFAULT_BIG_INT_ACTIONS: TypedActionMap<bigint>;
export declare class ToBigIntConvertor extends TypedActionsValueConvertor<bigint> {
    constructor(actions?: TypedActionMap<bigint>);
    initializeJSTypeSchema(source?: BasicJSTypeSchema): BasicJSTypeSchema;
}
