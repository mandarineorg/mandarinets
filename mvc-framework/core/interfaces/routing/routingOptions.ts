import { HttpStatusCode } from "../../enums/http/httpCodes.ts";

export interface RoutingOptions {
    responseStatus?: HttpStatusCode;
}