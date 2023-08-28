import { type TypeConversionAction, type TypeConversionSchema, type TypeConversionResolver } from '../schema/conversions';
import { type JSONObject } from '../schema/JSON';
import { TypedActionsValueConvertor, type TypedActionMap } from './actions';
export declare class ParseToBooleanAction implements TypeConversionAction<any, boolean> {
    transform(value: any, options?: JSONObject): boolean;
}
export declare class NegateBooleanAction implements TypeConversionAction<boolean> {
    transform(value: boolean): any;
}
export declare const DEFAULT_BOOLEAN_ACTIONS: TypedActionMap<boolean>;
export declare class ToBooleanConvertor extends TypedActionsValueConvertor<boolean> {
    constructor(actions?: TypedActionMap<boolean>);
    prepareValue(value: unknown, schema: Partial<TypeConversionSchema>, resolver?: TypeConversionResolver): unknown;
}
