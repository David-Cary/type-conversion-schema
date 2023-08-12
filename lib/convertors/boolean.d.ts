import { type TypeConversionAction, type JSONObject } from '../schema/conversions';
import { TypedActionsValueConvertor, type TypedActionMap } from './actions';
export declare class NegateBooleanAction implements TypeConversionAction<boolean> {
    transform(value: boolean, options?: JSONObject): any;
}
export declare const DEFAULT_BOOLEAN_ACTIONS: TypedActionMap<boolean>;
export declare class ToBooleanConvertor extends TypedActionsValueConvertor<boolean> {
    constructor(actions?: TypedActionMap<boolean>);
}
