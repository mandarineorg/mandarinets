import { InjectionTypes } from "./injectionTypes.ts";

export interface InjectionMetadataContext {
    injectionFieldType: "FIELD" | "PARAMETER";
    injectionType: InjectionTypes;
    parameterName: string;
    parameterIndex: number;
    parameterMethodName: string;
    parameterObjectToInject?: any;

    propertyName: string;
    propertyObjectToInject?: any;

    className: string;
}