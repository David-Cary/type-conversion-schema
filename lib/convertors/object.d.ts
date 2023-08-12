import { type TypeConversionAction, type JSONObject } from '../schema/conversions';
import { TypedActionsValueConvertor, type TypedActionMap } from './actions';
import { type JSONSchema } from 'json-schema-typed';
export type POJObject = Record<string, unknown>;
export declare function getObjectFrom(source: unknown): POJObject;
export declare class WrapInObjectAction implements TypeConversionAction<any, POJObject> {
    transform(value: any, options?: JSONObject): POJObject;
    replaceSchema(schema: JSONSchema, options?: JSONObject): JSONSchema;
}
export declare class CloneViaSpreadAction implements TypeConversionAction<POJObject> {
    transform(value: POJObject, options?: JSONObject): POJObject;
}
export declare class AssignObjectValuesAction implements TypeConversionAction<POJObject> {
    transform(value: POJObject, options?: JSONObject): POJObject;
}
export declare class AssignObjectDefaultsAction implements TypeConversionAction<POJObject> {
    transform(value: POJObject, options?: JSONObject): POJObject;
}
export declare class DeleteObjectValuesAction implements TypeConversionAction<POJObject> {
    transform(value: POJObject, options?: JSONObject): POJObject;
}
export declare const DEFAULT_OBJECT_ACTIONS: TypedActionMap<POJObject>;
export declare class ToObjectConvertor extends TypedActionsValueConvertor<POJObject> {
    constructor(actions?: TypedActionMap<POJObject>);
}