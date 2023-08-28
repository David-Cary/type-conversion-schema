import { type TypeConversionAction, type TypeConversionResolver, type TypeConversionSchema } from '../schema/conversions';
import { type JSONObject } from '../schema/JSON';
import { type AnyFunction } from '../schema/JSType';
import { TypedActionsValueConvertor, type TypedActionMap } from './actions';
export declare function getFunctionFrom(value: any): AnyFunction;
export declare class CreateWrapperFunctionAction implements TypeConversionAction<any, AnyFunction> {
    transform(value: any, options?: JSONObject, resolver?: TypeConversionResolver): AnyFunction;
    expandSchema(schema: Partial<TypeConversionSchema>, options?: JSONObject): void;
}
export declare const DEFAULT_FUNCTION_ACTIONS: TypedActionMap<AnyFunction>;
export declare class ToFunctionConvertor extends TypedActionsValueConvertor<AnyFunction> {
    constructor(actions?: TypedActionMap<AnyFunction>);
}
