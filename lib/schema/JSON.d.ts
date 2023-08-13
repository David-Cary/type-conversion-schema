export type JSONType = string | number | boolean | null | {
    [key: string]: JSONType;
} | JSONType[];
export type JSONObject = Record<string, JSONType>;
export declare function cloneJSON(source: any): any;
