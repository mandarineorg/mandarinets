import { ServerRequest } from "https://deno.land/std@v1.0.0-rc1/http/server.ts";
import { ControllerComponent } from "../../mvc-framework/core/internal/components/routing/controllerContext.ts";
import { RoutingAction } from "../../mvc-framework/core/internal/components/routing/routingAction.ts";

export interface ArgumentsResolverExtraData {
    request: ServerRequest;
    response: any;
    params: any;
    routingAction: RoutingAction;
}