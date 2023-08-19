import { type TypeConversionAction, type TypeConversionResolver } from '../schema/conversions';
import { type JSONObject } from '../schema/JSON';
import { type JSTypeSchema, type BasicJSTypeSchema, type AnyFunction } from '../schema/JSType';
import { TypedActionsValueConvertor, type TypedActionMap } from './actions';
export declare function getFunctionFrom(value: any): AnyFunction;
export declare class CreateConversionFunctionAction implements TypeConversionAction<any, AnyFunction> {
    transform(value: any, options?: JSONObject, resolver?: TypeConversionResolver): AnyFunction;
    createSchema(options?: JSONObject, resolver?: TypeConversionResolver): BasicJSTypeSchema;
    getParameterSchema(source: any, resolver?: TypeConversionResolver): JSTypeSchema;
    getParameterSchemas(source: any, resolver?: TypeConversionResolver): JSTypeSchema[];
}
export declare const DEFAULT_FUNCTION_ACTIONS: TypedActionMap<AnyFunction>;
export declare class ToSymbolConvertor extends TypedActionsValueConvertor<AnyFunction> {
    constructor(actions?: TypedActionMap<AnyFunction>);
}
