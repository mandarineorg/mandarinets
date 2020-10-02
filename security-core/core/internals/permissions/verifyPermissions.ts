// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import type { Mandarine } from "../../../../main-core/Mandarine.ns.ts";
import { PermissionValidatorsRegistry } from "./permissionValidatorsRegistry.ts";

const getExpressionParameters = (expression: string): Array<string> => {
    let str = expression;
    let args: any = /\(\s*([^)]+?)\s*\)/.exec(str);
    if (args[1]) {
        args = args[1].split(/\s*,\s*/);
    }
    return args;
}

const expressionHasParameters = (expression: string) => {
    try {
        getExpressionParameters(expression);
        return true;
    } catch {
        return false;
    }
}

const executeValidator = (permissionLowerName: string, request: Mandarine.MandarineMVC.RequestDataContext, authentication: Mandarine.Security.Auth.RequestAuthObj, inputs: Array<any> | undefined) => {
    const callValidator = PermissionValidatorsRegistry.getInstance().callValidator(permissionLowerName, request, authentication, inputs || []);
    if(callValidator === false) {
        return false;
    } else if(callValidator === true) {
        return true;
    }
}

const executeExpression = (expr: string, hasParameters: boolean, request: Mandarine.MandarineMVC.RequestDataContext, authentication: Mandarine.Security.Auth.RequestAuthObj) => {
    expr = expr.replace(`('`, '(').replace(`("`, '(').replace(`")`, ')').replace(`')`, ')');
    let inputs: Array<any> | undefined = undefined;
    if(hasParameters) inputs = getExpressionParameters(expr);
    return executeValidator(expr.toLowerCase(), request, authentication, inputs)
};

const processExpression = (request: Mandarine.MandarineMVC.RequestDataContext, authentication: Mandarine.Security.Auth.RequestAuthObj) => {
        return (expression: any) => {
            const divideExpression = expression.split(/(?!\(.*)\s(?![^(]*?\))/g);
            const evaluation: Array<any> = [];
            divideExpression.forEach((expr: string) => {
                if(expr === "OR" || expr === "AND" || expr === "||" || expr === "&&") {
                    if(expr === "OR") expr = "||";
                    if(expr === "AND") expr = "&&";
                    evaluation.push(expr);
                    return;
                }
                const hasParameters = expressionHasParameters(expr);
                let execution;
                if(hasParameters) {
                    execution = executeExpression(expr, hasParameters, request, authentication);
                } else if(expr.endsWith("()") || expr.endsWith("();")) {
                    execution = executeExpression(expr, false, request, authentication);
                } else {
                    execution = expr;
                }
                evaluation.push(String(execution));
            });

            const finalEvaluation = eval(`(${evaluation.join(" ")})`);

            return finalEvaluation;
        };
}

export const verifyPermissions = (request: Mandarine.MandarineMVC.RequestDataContext) => {
    return (permissions: Mandarine.Security.Auth.Permissions): boolean => {
        const authentication: Mandarine.Security.Auth.RequestAuthObj | undefined = (request.authentication) ? Object.assign({}, request.authentication) : undefined;
        const currentRoles = (<Array<string>>(authentication?.AUTH_PRINCIPAL?.roles))?.map((role) => role.toLowerCase());
        let isAllowed: boolean = true;

        if(Array.isArray(permissions)) {
            for(const permission of permissions) {
                const permissionLower = permission.toLowerCase();
                const expressionHasParametersStatement = expressionHasParameters(permissionLower);
                if((permissionLower.endsWith("()") || permissionLower.endsWith("();")) || expressionHasParametersStatement) {
                    let callValidator = processExpression(request, <Mandarine.Security.Auth.RequestAuthObj> authentication)(permission);
                    if(callValidator === false) {
                        isAllowed = false;
                    } else if(callValidator === true) {
                        isAllowed = true;
                        break;
                    }
                    continue;
                } else {
                    if(currentRoles === undefined || currentRoles?.length === 0) {
                        isAllowed = false;
                        break;
                    } else {
                        if(currentRoles.includes(permissionLower)) {
                            isAllowed = true;
                            break;
                        } else {
                            isAllowed = false;
                        }
                    }
                }
            }
        } else if(typeof permissions === 'string') {
            isAllowed = processExpression(request, <Mandarine.Security.Auth.RequestAuthObj> authentication)(permissions);
        }

        return isAllowed;
    }
}