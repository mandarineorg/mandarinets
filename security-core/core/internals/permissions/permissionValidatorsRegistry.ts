// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { Mandarine } from "../../../../main-core/Mandarine.ns.ts";
import { isAuthenticated } from "./validators/isAuthenticated.ts";
import { hasRole } from "./validators/hasRole.ts";

export class PermissionValidatorsRegistry {

    public static instance: PermissionValidatorsRegistry;

    private validators: Map<string, Mandarine.Security.Auth.PermissionValidator> = new Map<string, Mandarine.Security.Auth.PermissionValidator>();

    public constructor() {
        this.validators.set("isauthenticated", isAuthenticated);
        this.validators.set("hasrole", hasRole);
    }

    public callValidator(validatorName: string, request: any, authentication: any, inputs: Array<any>): boolean {
        const validator = this.validators.get(validatorName.split("(")[0]);
        if(validator) {
            return validator(request, authentication)(inputs);
        }
    }

    public getAllValidators() {
        return Array.from(this.validators.values());
    }

    public static getInstance() {
        if(!PermissionValidatorsRegistry.instance) PermissionValidatorsRegistry.instance = new PermissionValidatorsRegistry();
        return PermissionValidatorsRegistry.instance;
    }
    
}