import { type TypeConversionAction, type TypeConversionSchema, type TypeConversionResolver } from '../schema/conversions';
import { type JSONObject } from '../schema/JSON';
import { TypedActionsValueConvertor, type TypedActionMap } from './actions';
export declare class RoundNumberAction implements TypeConversionAction<number> {
    transform(value: number): number;
    expandSchema(schema: Partial<TypeConversionSchema>, options?: JSONObject): void;
}
export declare class RoundUpNumberAction extends RoundNumberAction {
    transform(value: number): number;
}
export declare class RoundDownNumberAction extends RoundNumberAction {
    transform(value: number): number;
}
export declare class PositiveNumberAction implements TypeConversionAction<number> {
    transform(value: number): number;
    expandSchema(schema: Partial<TypeConversionSchema>, options?: JSONObject): void;
}
export declare class NegativeNumberAction implements TypeConversionAction<number> {
    transform(value: number): number;
    expandSchema(schema: Partial<TypeConversionSchema>, options?: JSONObject): void;
}
export declare const DEFAULT_NUMBER_ACTIONS: TypedActionMap<number>;
export declare class ToNumberConvertor extends TypedActionsValueConvertor<number> {
    constructor(actions?: TypedActionMap<number>);
    prepareValue(value: unknown, schema: Partial<TypeConversionSchema>, resolver?: TypeConversionResolver): unknown;
    finalizeValue(value: number, schema: Partial<TypeConversionSchema>, resolver?: TypeConversionResolver): number;
    enforceRange(value: number, schema: Partial<TypeConversionSchema>): number;
    finalizeSchema(schema: Partial<TypeConversionSchema>, resolver?: TypeConversionResolver): void;
}
