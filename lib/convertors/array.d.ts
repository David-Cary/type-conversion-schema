import { type TypeConversionAction, type TypeConversionResolver, type TypeConversionSchema, type TypeConversionContext } from '../schema/conversions';
import { type JSONObject } from '../schema/JSON';
import { TypedActionsValueConvertor, type TypedActionMap } from './actions';
/**
 * Converts the provided value to an array.
 * This involves wrapping non-array values in an array with undefined values excluded.
 * @function
 * @param {unknown} source - value to be converted
 * @returns {any[]} source array or enclosing array for non-array sources
 */
export declare function getArrayFrom(source: unknown): any[];
/**
 * Creates a shallow copy of the target array.
 * If passed 'from' and 'to' numbers in the options this will only copy a subset of the array.
 * @class
 * @implements {TypeConversionAction<any[]>}
 */
export declare class CopyArrayAction implements TypeConversionAction<any[]> {
    transform(value: any[], options?: JSONObject): any[];
}
/**
 * Retrieves an array from a potential JSON string.
 * @class
 * @implements {TypeConversionAction<any, any[]>}
 */
export declare class ParseArrayStringAction implements TypeConversionAction<any, any[]> {
    transform(value: any, options?: JSONObject): any[];
}
/**
 * Adds a particular value to the target array.
 * If options include an index, that will be used as the target postion.  Otherwise the value will be added to the end.
 * If options include a repeat number that many copies of the value will be added.
 * If options do not include a value, the added value will be undefined.
 * @class
 * @implements {TypeConversionAction<any[]>}
 */
export declare class InsertArrayItemAction implements TypeConversionAction<any[]> {
    transform(value: any[], options?: JSONObject): any[];
}
/**
 * Removes values from the target array.
 * If options include an index, that will be used as the target postion.  Otherwise the value will be removed from the end.
 * If options include a count that many items will be removed.
 * @class
 * @implements {TypeConversionAction<any[]>}
 */
export declare class DeleteArrayItemAction implements TypeConversionAction<any[]> {
    transform(value: any[], options?: JSONObject): any[];
}
/**
 * Provides default actions for conversions to an array.
 * @const
 */
export declare const DEFAULT_ARRAY_ACTIONS: TypedActionMap<any[]>;
/**
 * Handles conversion of a given value to an array.
 * @class
 * @implements {TypedActionsValueConvertor<symbol>}
 */
export declare class ToArrayConvertor extends TypedActionsValueConvertor<any[]> {
    constructor(actions?: TypedActionMap<any[]>);
    prepareValue(value: unknown, schema: Partial<TypeConversionSchema>, resolver?: TypeConversionResolver): unknown;
    finalizeValue(value: any[], schema: Partial<TypeConversionSchema>, resolver?: TypeConversionResolver, context?: TypeConversionContext): any[];
    /**
     * Helper function that enforces array schema restrictions on the target array.
     * @function
     * @param {Partial<TypeConversionSchema>} schema - schema to be used
     * @param {any[]} value - array to be modified
     * @param TypeConversionResolver | undefined} resolver - conversion resolver to be used on nested values
     * @param {TypeConversionContext | undefined} context - additional values to be used for resolving references
     */
    applySchemaTo(schema: Partial<TypeConversionSchema>, target: any[], resolver?: TypeConversionResolver, context?: TypeConversionContext): void;
}
