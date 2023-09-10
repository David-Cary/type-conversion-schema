import { type TypeConversionAction, type TypeConversionSchema, type TypeConversionResolver } from '../schema/conversions';
import { TypedActionsValueConvertor } from './actions';
/**
 * Only applies non-type specific actions to the provided value.
 * @class
 * @implements {TypedActionsValueConvertor<any>}
 */
export declare class ToAnyConvertor extends TypedActionsValueConvertor<any> {
    constructor(actions?: Record<string, TypeConversionAction<any>>);
    finalizeValue(value: unknown, schema: Partial<TypeConversionSchema>, resolver?: TypeConversionResolver): unknown;
}
