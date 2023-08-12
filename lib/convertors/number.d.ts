import { type TypeConversionAction, type JSONObject } from '../schema/conversions';
import { TypedActionsValueConvertor, type TypedActionMap } from './actions';
import { type JSONSchema } from 'json-schema-typed';
export declare class DefaultNumberAction implements TypeConversionAction<number> {
    transform(value: number, options?: JSONObject): number;
}
export declare class RoundNumberAction implements TypeConversionAction<number> {
    transform(value: number, options?: JSONObject): number;
    modifySchema(schema: JSONSchema, options?: JSONObject): void;
}
export declare class RoundUpNumberAction extends RoundNumberAction {
    transform(value: number, options?: JSONObject): number;
}
export declare class RoundDownNumberAction extends RoundNumberAction {
    transform(value: number, options?: JSONObject): number;
}
export declare function getNumberWithDefault(source: any, defaultValue?: number): number;
export declare class NumberToMultipleOfAction implements TypeConversionAction<number> {
    transform(value: number, options?: JSONObject): number;
    modifySchema(schema: JSONSchema, options?: JSONObject): void;
}
export declare class MinimumNumberAction implements TypeConversionAction<number> {
    transform(value: number, options?: JSONObject): number;
    modifySchema(schema: JSONSchema, options?: JSONObject): void;
}
export declare class MaximumNumberAction implements TypeConversionAction<number> {
    transform(value: number, options?: JSONObject): number;
    modifySchema(schema: JSONSchema, options?: JSONObject): void;
}
export declare class PositiveNumberAction implements TypeConversionAction<number> {
    transform(value: number, options?: JSONObject): number;
    modifySchema(schema: JSONSchema, options?: JSONObject): void;
}
export declare class NegativeNumberAction implements TypeConversionAction<number> {
    transform(value: number, options?: JSONObject): number;
    modifySchema(schema: JSONSchema, options?: JSONObject): void;
}
export declare const DEFAULT_NUMBER_ACTIONS: TypedActionMap<number>;
export declare class ToNumberConvertor extends TypedActionsValueConvertor<number> {
    constructor(actions?: TypedActionMap<number>);
}
