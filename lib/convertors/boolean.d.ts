import { type TypeConversionAction, type JSONObject } from '../schema/conversions';
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
}
