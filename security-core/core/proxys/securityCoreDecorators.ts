// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import type { Mandarine } from "../../../main-core/Mandarine.ns.ts";
import { MandarineException } from "../../../main-core/exceptions/mandarineException.ts";
import { Reflect } from "../../../main-core/reflectMetadata.ts";
import { MandarineConstants } from "../../../main-core/mandarineConstants.ts";

export class SecurityCoreDecoratorsProxy {

    public static registerAllowOnlyDecorator(targetClass: any, permissions: Mandarine.Security.Auth.Permissions, methodName: string) {
        let isMethod: boolean = methodName != null;
        if(!Array.isArray(permissions) && !(typeof permissions === 'string')) throw new MandarineException(MandarineException.INVALID_ALLOWONLY_DECORATOR_PERMISSIONS);
        let newPermissions;
        if(Array.isArray(permissions)) {
            newPermissions = [...permissions];
        } else {
            newPermissions = permissions;
        }
        if(!isMethod) {
            Reflect.defineMetadata(MandarineConstants.REFLECTION_MANDARINE_SECURITY_ALLOWONLY_DECORATOR, newPermissions, targetClass);
        } else {
            Reflect.defineMetadata(`${MandarineConstants.REFLECTION_MANDARINE_SECURITY_ALLOWONLY_DECORATOR}:${methodName}`, newPermissions, targetClass, methodName);
        }
    }

}