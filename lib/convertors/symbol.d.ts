import { type TypeConversionAction, type TypeConversionSchema } from '../schema/conversions';
import { type JSONObject } from '../schema/JSON';
import { TypedActionsValueConvertor, type TypedActionMap } from './actions';
/**
 * Handles using the symbol for a particular key string.
 * @class
 * @implements {TypeConversionAction<any, symbol>}
 */
export declare class CreateKeySymbolAction implements TypeConversionAction<any, symbol> {
    transform(value: any, options?: JSONObject): symbol;
    expandSchema(schema: Partial<TypeConversionSchema>, options?: JSONObject): void;
}
/**
 * Provides default actions for conversions to a symbol.
 * @const
 */
export declare const DEFAULT_SYMBOL_ACTIONS: TypedActionMap<symbol>;
/**
 * Handles conversion of a given value to a symbol.
 * @class
 * @implements {TypedActionsValueConvertor<symbol>}
 */
export declare class ToSymbolConvertor extends TypedActionsValueConvertor<symbol> {
    constructor(actions?: TypedActionMap<symbol>);
}
