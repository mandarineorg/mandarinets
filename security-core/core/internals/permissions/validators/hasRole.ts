// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { Mandarine } from "../../../../../main-core/Mandarine.ns.ts";

export const hasRole: Mandarine.Security.Auth.PermissionValidator = (request: any, authentication: any) => {
    return (inputs: Array<any>): boolean => {
        if(authentication) {
            if(authentication.AUTH_PRINCIPAL) {
                return authentication.AUTH_PRINCIPAL.roles.includes(inputs[0]);
            }
        }
        return false;
    }
}