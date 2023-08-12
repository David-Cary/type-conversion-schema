import { ToBooleanConvertor } from './boolean';
import { ToLiteralConvertor } from './literal';
import { ToNumberConvertor } from './number';
import { ToStringConvertor } from './string';
export * from './actions';
export * from './boolean';
export * from './literal';
export * from './number';
export * from './string';
export declare const DEFAULT_TYPE_CONVERTORS: {
    boolean: ToBooleanConvertor;
    null: ToLiteralConvertor<null>;
    number: ToNumberConvertor;
    string: ToStringConvertor;
    undefined: ToLiteralConvertor<undefined>;
};
