// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import type { Mandarine } from "../../../main-core/Mandarine.ns.ts";
import { SecurityCoreDecoratorsProxy } from "../proxys/securityCoreDecorators.ts";

export const AllowOnly = (permissions: Mandarine.Security.Auth.Permissions) => {
    return (target: any, methodName?: string) => {
        SecurityCoreDecoratorsProxy.registerAllowOnlyDecorator(target, permissions, <string> methodName);
    }
}