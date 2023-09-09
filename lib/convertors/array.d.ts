import { type TypeConversionAction, type TypeConversionResolver, type TypeConversionSchema, type TypeConversionContext } from '../schema/conversions';
import { type JSONObject } from '../schema/JSON';
import { TypedActionsValueConvertor, type TypedActionMap } from './actions';
export declare function getArrayFrom(source: unknown): any[];
export declare class CopyArrayAction implements TypeConversionAction<any[]> {
    transform(value: any[], options?: JSONObject): any[];
}
export declare class ParseArrayStringAction implements TypeConversionAction<any, any[]> {
    transform(value: any, options?: JSONObject): any[];
}
export declare class InsertArrayItemAction implements TypeConversionAction<any[]> {
    transform(value: any[], options?: JSONObject): any[];
}
export declare class DeleteArrayItemAction implements TypeConversionAction<any[]> {
    transform(value: any[], options?: JSONObject): any[];
}
export declare const DEFAULT_ARRAY_ACTIONS: TypedActionMap<any[]>;
export declare class ToArrayConvertor extends TypedActionsValueConvertor<any[]> {
    constructor(actions?: TypedActionMap<any[]>);
    prepareValue(value: unknown, schema: Partial<TypeConversionSchema>, resolver?: TypeConversionResolver): unknown;
    finalizeValue(value: any[], schema: Partial<TypeConversionSchema>, resolver?: TypeConversionResolver, context?: TypeConversionContext): any[];
    applySchemaTo(schema: Partial<TypeConversionSchema>, target: any[], resolver?: TypeConversionResolver, context?: TypeConversionContext): void;
}
