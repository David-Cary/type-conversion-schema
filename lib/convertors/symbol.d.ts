import { type TypeConversionAction, type TypeConversionSchema } from '../schema/conversions';
import { type JSONObject } from '../schema/JSON';
import { TypedActionsValueConvertor, type TypedActionMap } from './actions';
export declare function getSymbolFrom(value: any): symbol;
export declare class CreateKeySymbolAction implements TypeConversionAction<any, symbol> {
    transform(value: any, options?: JSONObject): symbol;
    expandSchema(schema: Partial<TypeConversionSchema>, options?: JSONObject): void;
}
export declare const DEFAULT_SYMBOL_ACTIONS: TypedActionMap<symbol>;
export declare class ToSymbolConvertor extends TypedActionsValueConvertor<symbol> {
    constructor(actions?: TypedActionMap<symbol>);
}
