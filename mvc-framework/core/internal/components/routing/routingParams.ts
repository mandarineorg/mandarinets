import { ModuleRelation } from "../../../interfaces/moduleRelation.ts";
import { DI } from "../../../../../main-core/dependency-injection/di.ns.ts";

export interface RoutingParams {
    relation?: ModuleRelation;
    routeName?: string;
    routeIndex?: number;
}

export interface ArgsParams {
    paramType: DI.InjectionTypes;
    relation: ModuleRelation;
    index: number;
    name?: string;
}