import { HttpMethods } from "../../enums/http/httpMethods.ts";
import { RoutingOptions } from "./routingOptions.ts";

export interface RoutingAnnotationContext {
    route: string;
    methodType: HttpMethods;
    methodName: string;
    options: RoutingOptions;
    className?: string;
}