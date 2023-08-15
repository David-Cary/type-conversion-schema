import { type TypeConversionAction, type TypedActionRequest, type TypeMarkedObject, type TypedValueConvertor, type TypeConversionResolver, type TypeConversionSchema } from '../schema/conversions';
import { type BasicJSTypeSchema } from '../schema/JSType';
import { type JSONObject } from '../schema/JSON';
export declare class ForceValueAction implements TypeConversionAction {
    transform(value: any, options?: JSONObject): any;
}
export declare class DefaultValueAction implements TypeConversionAction {
    transform(value: any, options?: JSONObject): any;
}
export declare class GetValueAction implements TypeConversionAction {
    transform(value: any, options?: JSONObject): any;
}
export declare function getActionRequestFrom(source: any): TypedActionRequest | undefined;
export declare function getConversionSchemaFrom(source: any): TypeConversionSchema | undefined;
export declare class NestedConversionAction implements TypeConversionAction {
    transform(value: any, options?: JSONObject, resolver?: TypeConversionResolver): any;
    createSchema(options?: JSONObject, resolver?: TypeConversionResolver): BasicJSTypeSchema;
}
export declare const DEFAULT_UNTYPED_CONVERSIONS: {
    convert: NestedConversionAction;
    default: DefaultValueAction;
    get: GetValueAction;
    setTo: ForceValueAction;
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
    convertWith(value: unknown, schema: Partial<TypeConversionSchema>, resolver?: TypeConversionResolver): T;
    expandActionRequest(request: TypedActionRequest): TypeMarkedObject;
    runPreparation(schema: Partial<TypeConversionSchema>, callback: VisitActionCallback<any>): void;
    runConversion(schema: Partial<TypeConversionSchema>, callback: VisitActionCallback<any, T>): void;
    runFinalization(schema: Partial<TypeConversionSchema>, callback: VisitActionCallback<T>): void;
    createJSTypeSchema(source?: Partial<TypeConversionSchema>, resolver?: TypeConversionResolver): BasicJSTypeSchema;
    getModifiedSchema(action: TypeConversionAction, options?: JSONObject, resolver?: TypeConversionResolver, source?: BasicJSTypeSchema): BasicJSTypeSchema | undefined;
    initializeJSTypeSchema(source?: BasicJSTypeSchema): BasicJSTypeSchema;
}
