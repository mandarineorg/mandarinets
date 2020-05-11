import { HttpMethods } from "../../../enums/http/httpMethods.ts";
import { RoutingOptions } from "../../../interfaces/routing/routingOptions.ts";
import { RoutingParams, ArgsParams } from "./routingParams.ts";
import { InitializationStatus } from "../../../enums/internal/routingInitializationStatus.ts";

export interface RoutingAction {
    actionParent?: string;
    actionType: HttpMethods,
    actionMethodName: string; 
    route: string;
    routingOptions?: RoutingOptions;
    routeParams?: RoutingParams[];
    methodParams?: ArgsParams[];
    initializationStatus: InitializationStatus;
}