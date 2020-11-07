// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import type { Mandarine } from "../../../main-core/Mandarine.ns.ts";

export class LoginHandler implements Mandarine.Security.Auth.Handler {

    private buildResponse(result: any, response: any) {
        response.body = {
            status: result.status,
            exception: result.exception,
            message: result.message
        };
    }

    public onSuccess(request: any, response: any, result: Mandarine.Security.Auth.AuthenticationResult) {
        this.buildResponse(result, response);
    }

    public onFailure(request: any, response: any, result: Mandarine.Security.Auth.AuthenticationResult) {
        this.buildResponse(result, response);
    }

}