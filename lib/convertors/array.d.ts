import { type TypeConversionAction, type TypeConversionResolver } from '../schema/conversions';
import { type JSONObject } from '../schema/JSON';
import { TypedActionsValueConvertor, type TypedActionMap } from './actions';
import { type BasicJSTypeSchema, type JSTypeSchema, type ArraySchema } from '../schema/JSType';
import { type PropertyConversionSchema } from './object';
export declare function getArrayFrom(source: unknown): any[];
export declare function resolveIndexedConversion(source: any, index: number, schema: PropertyConversionSchema, resolver?: TypeConversionResolver): any;
export declare class ModifyArrayAction implements TypeConversionAction<any[]> {
    transform(value: any[], options?: JSONObject, resolver?: TypeConversionResolver): any[];
    modifySchema(schema: BasicJSTypeSchema, options?: JSONObject, resolver?: TypeConversionResolver): BasicJSTypeSchema;
    initializeArray(target: any[], options: JSONObject, source?: any[], resolver?: TypeConversionResolver): void;
    initializeArraySchema(schema: ArraySchema, options: JSONObject, resolver?: TypeConversionResolver): void;
    getPropertyConversions(source: any): PropertyConversionSchema[];
    getItemSchema(source: any, resolver?: TypeConversionResolver): JSTypeSchema;
}
export declare class CreateSpecifiedArrayAction extends ModifyArrayAction implements TypeConversionAction<any, any[]> {
    transform(value: any, options?: JSONObject, resolver?: TypeConversionResolver): any[];
    createSchema(options?: JSONObject, resolver?: TypeConversionResolver): BasicJSTypeSchema;
}
export declare class CopyArrayAction implements TypeConversionAction<any[]> {
    transform(value: any[], options?: JSONObject): any[];
}
export declare const DEFAULT_ARRAY_ACTIONS: TypedActionMap<any[]>;
export declare class ToArrayConvertor extends TypedActionsValueConvertor<any[]> {
    constructor(actions?: TypedActionMap<any[]>);
}
