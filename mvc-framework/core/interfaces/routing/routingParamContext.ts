import { DI } from "../../../../main-core/dependency-injection/di.ns.ts";

export interface routingParamContext {
    methodName: string;
    parameterName: string;
    parameterIndex: number;
    parameterType: DI.InjectionTypes;
    className?: string;
}