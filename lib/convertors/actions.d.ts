import { type TypeConversionAction, type TypedActionRequest, type TypeMarkedObject, type TypedValueConvertor, type TypeConversionResolver, type TypeConversionSchema, type TypeConversionContext } from '../schema/conversions';
import { type JSONObject } from '../schema/JSON';
export declare function getNestedValue(source: any, path: any): any;
export declare class GetValueAction implements TypeConversionAction {
    transform(value: any, options?: JSONObject): any;
}
export declare function getActionRequestFrom(source: any): TypedActionRequest | undefined;
export declare function getConversionSchemaFrom(source: any): TypeConversionSchema | undefined;
export declare class NestedConversionAction implements TypeConversionAction {
    transform(value: any, options?: JSONObject, resolver?: TypeConversionResolver): any;
    expandSchema(schema: Partial<TypeConversionSchema>, options?: JSONObject, resolver?: TypeConversionResolver): void;
}
export declare const DEFAULT_UNTYPED_CONVERSIONS: {
    convert: NestedConversionAction;
    get: GetValueAction;
};
export interface TypedActionMap<T> {
    typed: Record<string, TypeConversionAction<T>>;
    untyped: Record<string, TypeConversionAction<any>>;
    conversion: Record<string, TypeConversionAction<any, T>>;
}
export type VisitActionCallback<F, T = F> = (action: TypeConversionAction<F, T>, options?: JSONObject) => void;
export declare class TypedActionsValueConvertor<T = any> implements TypedValueConvertor<T> {
    readonly typeName: string;
    readonly convert: (value: unknown) => T;
    readonly actions: TypedActionMap<T>;
    constructor(typeName: string, convert: (value: unknown) => T, actions?: Partial<TypedActionMap<T>>);
    matches(value: unknown): boolean;
    convertWith(value: unknown, schema: Partial<TypeConversionSchema>, resolver?: TypeConversionResolver, context?: TypeConversionContext): T;
    prepareValue(value: unknown, schema: Partial<TypeConversionSchema>, resolver?: TypeConversionResolver, context?: TypeConversionContext): unknown;
    finalizeValue(value: T, schema: Partial<TypeConversionSchema>, resolver?: TypeConversionResolver, context?: TypeConversionContext): T;
    expandActionRequest(request: TypedActionRequest): TypeMarkedObject;
    expandSchema(schema: Partial<TypeConversionSchema>, resolver?: TypeConversionResolver): void;
    prepareSchema(schema: Partial<TypeConversionSchema>, resolver?: TypeConversionResolver): void;
    finalizeSchema(schema: Partial<TypeConversionSchema>, resolver?: TypeConversionResolver): void;
    expandSchemaFor(schema: Partial<TypeConversionSchema>, request: TypedActionRequest, actionMap: Record<string, TypeConversionAction<any>>, resolver?: TypeConversionResolver): void;
}
