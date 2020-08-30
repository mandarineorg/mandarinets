// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { Mandarine } from "../../../../../main-core/Mandarine.ns.ts";

export const isAuthenticated: Mandarine.Security.Auth.PermissionValidator = (request: any, authentication: any) => {
    return () => {
        return authentication !== undefined;
    }
}