import { type TypeConversionAction, type TypeConversionSchema, type TypeConversionResolver } from '../schema/conversions';
import { type JSONObject } from '../schema/JSON';
import { TypedActionsValueConvertor, type TypedActionMap } from './actions';
/**
 * Reads in certain predefined values as false.
 * By default, this is just the string 'false', but other values can be passed in through the option's 'false' property.
 * @class
 * @implements {TypeConversionAction<any[], boolean>}
 */
export declare class ParseToBooleanAction implements TypeConversionAction<any, boolean> {
    transform(value: any, options?: JSONObject): boolean;
}
/**
 * Flips the value of provided boolean from true to false and vice versa.
 * @class
 * @implements {TypeConversionAction<boolean>}
 */
export declare class NegateBooleanAction implements TypeConversionAction<boolean> {
    transform(value: boolean): any;
}
/**
 * Provides default actions for conversions to a boolean.
 * @const
 */
export declare const DEFAULT_BOOLEAN_ACTIONS: TypedActionMap<boolean>;
/**
 * Handles conversion of a given value to a boolean.
 * @class
 * @implements {TypedActionsValueConvertor<boolean>}
 */
export declare class ToBooleanConvertor extends TypedActionsValueConvertor<boolean> {
    constructor(actions?: TypedActionMap<boolean>);
    prepareValue(value: unknown, schema: Partial<TypeConversionSchema>, resolver?: TypeConversionResolver): unknown;
}
