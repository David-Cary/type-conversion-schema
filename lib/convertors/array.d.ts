import { type TypeConversionAction, type TypeConversionResolver, type TypeConversionSchema } from '../schema/conversions';
import { type JSONObject } from '../schema/JSON';
import { TypedActionsValueConvertor, type TypedActionMap } from './actions';
import { type JSTypeSchema, type ArraySchema } from '../schema/JSType';
export declare function getArrayFrom(source: unknown): any[];
export declare class CopyArrayAction implements TypeConversionAction<any[]> {
    transform(value: any[], options?: JSONObject): any[];
}
export declare class InsertArrayItemAction implements TypeConversionAction<any[]> {
    transform(value: any[], options?: JSONObject): any[];
}
export declare class RemoveArrayItemAction implements TypeConversionAction<any[]> {
    transform(value: any[], options?: JSONObject): any[];
}
export declare class SetArrayItemAction implements TypeConversionAction<any[]> {
    transform(value: any[], options?: JSONObject, resolver?: TypeConversionResolver): any[];
}
export declare class ModifyArrayAction implements TypeConversionAction<any[]> {
    transform(value: any[], options?: JSONObject, resolver?: TypeConversionResolver): any[];
    getArraySchemaFrom(source: JSONObject): ArraySchema;
    getSchemaList(source: any[]): JSTypeSchema[];
    getSchemaFrom(source: any): JSTypeSchema | undefined;
    applySchemaTo(schema: Partial<TypeConversionSchema>, target: any[], resolver?: TypeConversionResolver): void;
}
export declare const DEFAULT_ARRAY_ACTIONS: TypedActionMap<any[]>;
export declare class ToArrayConvertor extends TypedActionsValueConvertor<any[]> {
    readonly mutator: ModifyArrayAction;
    constructor(actions?: TypedActionMap<any[]>);
    prepareValue(value: unknown, schema: Partial<TypeConversionSchema>, resolver?: TypeConversionResolver): unknown;
    finalizeValue(value: any[], schema: Partial<TypeConversionSchema>, resolver?: TypeConversionResolver): any[];
}
