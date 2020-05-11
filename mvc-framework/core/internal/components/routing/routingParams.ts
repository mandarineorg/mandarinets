import { ModuleRelation } from "../../../interfaces/moduleRelation.ts";
import { InjectionTypes } from "../../../../../main-core/dependency-injection/injectionTypes.ts";

export interface RoutingParams {
    relation?: ModuleRelation;
    routeName?: string;
    routeIndex?: number;
}

export interface ArgsParams {
    paramType: InjectionTypes;
    relation: ModuleRelation;
    index: number;
    name?: string;
}