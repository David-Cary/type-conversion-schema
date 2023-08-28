import { type TypeConversionAction, type TypeConversionRequest, type TypeConversionResolver, type TypeConversionSchema } from '../schema/conversions';
import { type JSONObject } from '../schema/JSON';
import { TypedActionsValueConvertor, type TypedActionMap } from './actions';
import { type JSTypeSchema, type ObjectSchema } from '../schema/JSType';
export type POJObject = Record<string, unknown>;
export declare function getObjectFrom(source: unknown): POJObject;
export declare function getConversionRequestFrom(source: any): TypeConversionRequest | undefined;
export declare class OmitPropertiesAction implements TypeConversionAction<POJObject> {
    transform(value: POJObject, options?: JSONObject): POJObject;
}
export declare class PickPropertiesAction implements TypeConversionAction<POJObject> {
    transform(value: POJObject, options?: JSONObject): POJObject;
}
export declare class ModifyObjectPropertiesAction implements TypeConversionAction<POJObject> {
    transform(value: POJObject, options?: JSONObject, resolver?: TypeConversionResolver): POJObject;
    getObjectSchemaFrom(source: JSONObject): ObjectSchema;
    getSchemaMap(source: Record<string, any>): Record<string, JSTypeSchema>;
    getSchemaFrom(source: any): JSTypeSchema | undefined;
    applySchemaTo(schema: Partial<TypeConversionSchema>, target: POJObject, resolver?: TypeConversionResolver): void;
}
export declare class SetObjectPropertiesAction extends ModifyObjectPropertiesAction {
    transform(value: POJObject, options?: JSONObject, resolver?: TypeConversionResolver): POJObject;
}
export declare class CreateWrapperObjectAction implements TypeConversionAction<any, POJObject> {
    transform(value: any, options?: JSONObject): POJObject;
}
export declare const DEFAULT_OBJECT_ACTIONS: TypedActionMap<POJObject>;
export declare class ToObjectConvertor extends TypedActionsValueConvertor<POJObject> {
    readonly clone: (value: any) => any;
    readonly mutator: ModifyObjectPropertiesAction;
    constructor(actions?: TypedActionMap<POJObject>, cloneVia?: (value: any) => any);
    prepareValue(value: unknown, schema: Partial<TypeConversionSchema>, resolver?: TypeConversionResolver): unknown;
    finalizeValue(value: POJObject, schema: Partial<TypeConversionSchema>, resolver?: TypeConversionResolver): POJObject;
}
