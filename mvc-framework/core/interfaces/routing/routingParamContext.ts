import { InjectionTypes } from "../../../../main-core/dependency-injection/injectionTypes.ts";

export interface routingParamContext {
    methodName: string;
    parameterName: string;
    parameterIndex: number;
    parameterType: InjectionTypes;
    className?: string;
}