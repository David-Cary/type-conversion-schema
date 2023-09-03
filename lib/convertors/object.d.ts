import { type TypeConversionAction, type TypeConversionResolver, type TypeConversionSchema } from '../schema/conversions';
import { type JSONObject } from '../schema/JSON';
import { TypedActionsValueConvertor, type TypedActionMap } from './actions';
export type POJObject = Record<string, unknown>;
export declare function getObjectFrom(source: unknown): POJObject;
export declare class CreateWrapperObjectAction implements TypeConversionAction<any, POJObject> {
    transform(value: any, options?: JSONObject): POJObject;
}
export declare class OmitPropertiesAction implements TypeConversionAction<POJObject> {
    transform(value: POJObject, options?: JSONObject): POJObject;
}
export declare class PickPropertiesAction implements TypeConversionAction<POJObject> {
    transform(value: POJObject, options?: JSONObject): POJObject;
}
export declare class SetNestedValueAction<T> implements TypeConversionAction<T> {
    transform(value: T, options?: JSONObject): T;
    setNestedValue(collection: any, path: any, value: unknown): void;
    createCollectionFor(key: any): POJObject | any[] | undefined;
}
export declare class DeleteNestedValueAction<T> implements TypeConversionAction<T> {
    transform(value: T, options?: JSONObject): T;
    deleteNestedValue(collection: any, path: any): void;
}
export declare const DEFAULT_OBJECT_ACTIONS: TypedActionMap<POJObject>;
export declare class ToObjectConvertor extends TypedActionsValueConvertor<POJObject> {
    readonly clone: (value: any) => any;
    constructor(actions?: TypedActionMap<POJObject>, cloneVia?: (value: any) => any);
    prepareValue(value: unknown, schema: Partial<TypeConversionSchema>, resolver?: TypeConversionResolver): unknown;
    finalizeValue(value: POJObject, schema: Partial<TypeConversionSchema>, resolver?: TypeConversionResolver): POJObject;
    applySchemaTo(schema: Partial<TypeConversionSchema>, target: POJObject, resolver?: TypeConversionResolver): void;
}
