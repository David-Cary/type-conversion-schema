import { type TypeConversionAction, type TypeConversionRequest, type TypeConversionResolver } from '../schema/conversions';
import { type JSONObject } from '../schema/JSON';
import { TypedActionsValueConvertor, type TypedActionMap } from './actions';
import { type BasicJSTypeSchema, type JSTypeSchema, type ObjectSchema } from '../schema/JSType';
export type POJObject = Record<string, unknown>;
export declare function getObjectFrom(source: unknown): POJObject;
export declare function getConversionRequestFrom(source: any): TypeConversionRequest | undefined;
export interface PropertyConversionSchema {
    from?: Array<string | number>;
    as?: TypeConversionRequest;
    default?: any;
}
export declare function getPropertyConversionFrom(source: any): PropertyConversionSchema;
export declare function resolvePropertyConversion(source: any, key: string, schema: PropertyConversionSchema, resolver?: TypeConversionResolver): any;
export declare class ModifyObjectPropertiesAction implements TypeConversionAction<POJObject> {
    transform(value: POJObject, options?: JSONObject, resolver?: TypeConversionResolver): POJObject;
    modifySchema(schema: BasicJSTypeSchema, options?: JSONObject, resolver?: TypeConversionResolver): BasicJSTypeSchema;
    initializeObjectProperties(target: POJObject, options: JSONObject, source?: POJObject, resolver?: TypeConversionResolver): void;
    initializeObjectSchema(schema: ObjectSchema, options: JSONObject, resolver?: TypeConversionResolver): void;
    getPropertyConversionMap(source: any): Record<string, PropertyConversionSchema>;
    getPropertySchema(source: any, resolver?: TypeConversionResolver): JSTypeSchema;
}
export declare class CreateSpecifiedObjectAction extends ModifyObjectPropertiesAction implements TypeConversionAction<any, POJObject> {
    transform(value: any, options?: JSONObject, resolver?: TypeConversionResolver): POJObject;
    createSchema(options?: JSONObject, resolver?: TypeConversionResolver): BasicJSTypeSchema;
}
export declare class CloneViaSpreadAction implements TypeConversionAction<POJObject> {
    transform(value: POJObject, options?: JSONObject): POJObject;
}
export declare class DeleteNestedValueAction<T = any> implements TypeConversionAction<T> {
    transform(value: T, options?: JSONObject): T;
    modifySchema(schema: BasicJSTypeSchema, options?: JSONObject): BasicJSTypeSchema;
    getSubSchema(source: JSTypeSchema, key: any): JSTypeSchema | undefined;
}
export declare class SetNestedValueAction<T = any> extends DeleteNestedValueAction<T> {
    transform(value: T, options?: JSONObject, resolver?: TypeConversionResolver): T;
    getConversionRequestFrom(source: unknown): TypeConversionRequest | undefined;
    modifySchema(schema: BasicJSTypeSchema, options?: JSONObject, resolver?: TypeConversionResolver): BasicJSTypeSchema;
    setSubSchema(target: JSTypeSchema, key: any, value: JSTypeSchema): void;
    createSubSchema(key: any): BasicJSTypeSchema | undefined;
    createValueSchema(options: JSONObject, resolver?: TypeConversionResolver): JSTypeSchema;
}
export declare const DEFAULT_OBJECT_ACTIONS: TypedActionMap<POJObject>;
export declare class ToObjectConvertor extends TypedActionsValueConvertor<POJObject> {
    constructor(actions?: TypedActionMap<POJObject>);
}
