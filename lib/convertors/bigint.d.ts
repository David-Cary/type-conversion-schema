import { type TypeConversionAction, type TypeConversionSchema, type TypeConversionResolver } from '../schema/conversions';
import { type JSONObject } from '../schema/JSON';
import { TypedActionsValueConvertor, type TypedActionMap } from './actions';
/**
 * Converts the provided value to a BigInt.
 * This involves wrapping non-array values in an array with undefined values excluded.
 * @function
 * @param {unknown} source - value to be converted
 * @returns {any} source array or enclosing array for non-array sources
 */
export declare function getBigIntFrom(value: any, defaultValue?: bigint): bigint;
/**
 * Forces the value to a positive BigInt, flipping the value of negatives.
 * @class
 * @implements {TypeConversionAction<bigint>}
 */
export declare class PositiveBigIntAction implements TypeConversionAction<bigint> {
    transform(value: bigint): bigint;
    expandSchema(schema: Partial<TypeConversionSchema>, options?: JSONObject): void;
}
/**
 * Forces the value to a negative BigInt, flipping the value of positives.
 * @class
 * @implements {TypeConversionAction<bigint>}
 */
export declare class NegativeBigIntAction implements TypeConversionAction<bigint> {
    transform(value: bigint): bigint;
    expandSchema(schema: Partial<TypeConversionSchema>, options?: JSONObject): void;
}
/**
 * Provides default actions for conversions to a BigInt.
 * @const
 */
export declare const DEFAULT_BIG_INT_ACTIONS: TypedActionMap<bigint>;
/**
 * Handles conversion of a given value to a BigInt.
 * @class
 * @implements {TypedActionsValueConvertor<bigint>}
 */
export declare class ToBigIntConvertor extends TypedActionsValueConvertor<bigint> {
    constructor(actions?: TypedActionMap<bigint>);
    prepareValue(value: unknown, schema: Partial<TypeConversionSchema>, resolver?: TypeConversionResolver): unknown;
    finalizeValue(value: bigint, schema: Partial<TypeConversionSchema>, resolver?: TypeConversionResolver): bigint;
    enforceRange(value: bigint, schema: Partial<TypeConversionSchema>): bigint;
    finalizeSchema(schema: Partial<TypeConversionSchema>, resolver?: TypeConversionResolver): void;
}
