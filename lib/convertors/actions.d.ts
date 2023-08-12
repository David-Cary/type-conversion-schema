import { type TypeConversionAction, type TypedActionRequest, type TypeMarkedObject, type TypedValueConvertor, type TypeConversionResolver, type TypeConversionSchema, type JSONObject } from '../schema/conversions';
export declare class ForceValueAction implements TypeConversionAction {
    transform(value: any, options?: JSONObject): any;
}
export declare class DefaultValueAction implements TypeConversionAction {
    transform(value: any, options?: JSONObject): any;
}
export declare class GetValueAction implements TypeConversionAction {
    transform(value: any, options?: JSONObject): any;
}
export declare function getConversionSchemaFromJSON(source: JSONObject): TypeConversionSchema;
export declare class NestedConversionAction implements TypeConversionAction {
    transform(value: any, options?: JSONObject, resolver?: TypeConversionResolver): any;
}
export declare const DEFAULT_UNTYPED_CONVERSIONS: {
    convert: NestedConversionAction;
    get: GetValueAction;
    setTo: ForceValueAction;
};
export interface TypedActionMap<T> {
    typed: Record<string, TypeConversionAction<T>>;
    untyped: Record<string, TypeConversionAction<any>>;
}
export declare function cloneTypedActionMap<T>(source: TypedActionMap<T>): TypedActionMap<T>;
export declare class TypedActionsValueConvertor<T = any> implements TypedValueConvertor<T> {
    readonly typeName: string;
    readonly convert: (value: unknown) => T;
    readonly actions: TypedActionMap<T>;
    constructor(typeName: string, convert: (value: unknown) => T, actions: TypedActionMap<T>);
    getAction(key: string): TypeConversionAction | undefined;
    matches(value: unknown): boolean;
    convertWith(value: unknown, actions: TypedActionRequest[], resolver?: TypeConversionResolver): T;
    expandActionRequest(source: TypedActionRequest): TypeMarkedObject;
}
