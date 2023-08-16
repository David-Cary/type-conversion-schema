import { type TypeConversionAction, type TypeConversionRequest, type TypeConversionResolver } from '../schema/conversions';
import { type JSONObject } from '../schema/JSON';
import { TypedActionsValueConvertor, type TypedActionMap } from './actions';
import { type BasicJSTypeSchema } from '../schema/JSType';
export type POJObject = Record<string, unknown>;
export declare function getObjectFrom(source: unknown): POJObject;
export declare class WrapInObjectAction implements TypeConversionAction<any, POJObject> {
    transform(value: any, options?: JSONObject): POJObject;
    createSchema(): BasicJSTypeSchema;
    modifySchema(schema: BasicJSTypeSchema, options?: JSONObject): BasicJSTypeSchema;
}
export declare class CloneViaSpreadAction implements TypeConversionAction<POJObject> {
    transform(value: POJObject, options?: JSONObject): POJObject;
}
export declare class AssignObjectValuesAction implements TypeConversionAction<POJObject> {
    transform(value: POJObject, options?: JSONObject): POJObject;
    modifySchema(schema: BasicJSTypeSchema, options?: JSONObject): BasicJSTypeSchema;
}
export declare class AssignObjectDefaultsAction implements TypeConversionAction<POJObject> {
    transform(value: POJObject, options?: JSONObject): POJObject;
    modifySchema(schema: BasicJSTypeSchema, options?: JSONObject): BasicJSTypeSchema;
}
export declare class DeleteObjectValueAction implements TypeConversionAction<POJObject> {
    transform(value: POJObject, options?: JSONObject): POJObject;
    modifySchema(schema: BasicJSTypeSchema, options?: JSONObject): BasicJSTypeSchema;
}
export declare class SetObjectPropertyAction implements TypeConversionAction<POJObject> {
    transform(value: POJObject, options?: JSONObject, resolver?: TypeConversionResolver): POJObject;
    modifySchema(schema: BasicJSTypeSchema, options?: JSONObject, resolver?: TypeConversionResolver): BasicJSTypeSchema;
    getConversionRequestFrom(source: unknown): TypeConversionRequest | undefined;
}
export declare const DEFAULT_OBJECT_ACTIONS: TypedActionMap<POJObject>;
export declare class ToObjectConvertor extends TypedActionsValueConvertor<POJObject> {
    constructor(actions?: TypedActionMap<POJObject>);
}
