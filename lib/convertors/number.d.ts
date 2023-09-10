import { type TypeConversionAction, type TypeConversionSchema, type TypeConversionResolver } from '../schema/conversions';
import { type JSONObject } from '../schema/JSON';
import { TypedActionsValueConvertor, type TypedActionMap } from './actions';
/**
 * Rounds the provided number to the nearest integer value.
 * @class
 * @implements {TypeConversionAction<number>}
 */
export declare class RoundNumberAction implements TypeConversionAction<number> {
    transform(value: number): number;
    expandSchema(schema: Partial<TypeConversionSchema>, options?: JSONObject): void;
}
/**
 * Rounds the provided number to the next highest integer value.
 * @class
 * @implements {RoundNumberAction}
 */
export declare class RoundUpNumberAction extends RoundNumberAction {
    transform(value: number): number;
}
/**
 * Rounds the provided number to the next lowest integer value.
 * @class
 * @implements {RoundNumberAction}
 */
export declare class RoundDownNumberAction extends RoundNumberAction {
    transform(value: number): number;
}
/**
 * Forces the value to a positive number, flipping the value of negatives.
 * @class
 * @implements {TypeConversionAction<number>}
 */
export declare class PositiveNumberAction implements TypeConversionAction<number> {
    transform(value: number): number;
    expandSchema(schema: Partial<TypeConversionSchema>, options?: JSONObject): void;
}
/**
 * Forces the value to a negative number, flipping the value of positives.
 * @class
 * @implements {TypeConversionAction<number>}
 */
export declare class NegativeNumberAction implements TypeConversionAction<number> {
    transform(value: number): number;
    expandSchema(schema: Partial<TypeConversionSchema>, options?: JSONObject): void;
}
/**
 * Provides default actions for conversions to a number.
 * @const
 */
export declare const DEFAULT_NUMBER_ACTIONS: TypedActionMap<number>;
/**
 * Handles conversion of a given value to a number.
 * @class
 * @implements {TypedActionsValueConvertor<number>}
 */
export declare class ToNumberConvertor extends TypedActionsValueConvertor<number> {
    constructor(actions?: TypedActionMap<number>);
    prepareValue(value: unknown, schema: Partial<TypeConversionSchema>, resolver?: TypeConversionResolver): unknown;
    finalizeValue(value: number, schema: Partial<TypeConversionSchema>, resolver?: TypeConversionResolver): number;
    enforceRange(value: number, schema: Partial<TypeConversionSchema>): number;
    finalizeSchema(schema: Partial<TypeConversionSchema>, resolver?: TypeConversionResolver): void;
}
