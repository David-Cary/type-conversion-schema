import { type TypeConversionAction, type TypeConversionResolver, type TypeConversionSchema } from '../schema/conversions';
import { type JSONObject } from '../schema/JSON';
import { type AnyFunction } from '../schema/JSType';
import { TypedActionsValueConvertor, type TypedActionMap } from './actions';
/**
 * Creates a function that returns the provided value.
 * If a 'returns' option is provided, that will be used as a conversion schema to be applied to the provided value.
 * @class
 * @implements {TypeConversionAction<any, AnyFunction>}
 */
export declare class CreateWrapperFunctionAction implements TypeConversionAction<any, AnyFunction> {
    transform(value: any, options?: JSONObject, resolver?: TypeConversionResolver): AnyFunction;
    expandSchema(schema: Partial<TypeConversionSchema>, options?: JSONObject): void;
}
/**
 * Provides default actions for conversions to a function.
 * @const
 */
export declare const DEFAULT_FUNCTION_ACTIONS: TypedActionMap<AnyFunction>;
/**
 * Handles conversion of a given value to a function.
 * @class
 * @implements {TypedActionsValueConvertor<AnyFunction>}
 */
export declare class ToFunctionConvertor extends TypedActionsValueConvertor<AnyFunction> {
    constructor(actions?: TypedActionMap<AnyFunction>);
}
