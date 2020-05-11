import { HttpStatusCode } from "../../../enums/http/httpCodes.ts";

export const ResponseStatus = (httpCode: HttpStatusCode): Function => {
    return (target: any, methodName: string) => {
       //
    };
}