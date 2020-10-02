// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { Test, DenoAsserts, Orange, mockDecorator, MockCookies } from "../mod.ts";
import { ApplicationContext } from "../../main-core/application-context/mandarineApplicationContext.ts";
import { MVCDecoratorsProxy } from "../../mvc-framework/core/proxys/mvcCoreDecorators.ts";
import { SecurityCoreDecoratorsProxy } from "../../security-core/core/proxys/securityCoreDecorators.ts";
import type { ControllerComponent } from "../../mvc-framework/core/internal/components/routing/controllerContext.ts";
import { MandarineMvc } from "../../mvc-framework/mandarine-mvc.ns.ts";
import type { Mandarine } from "../../main-core/Mandarine.ns.ts";
import { verifyPermissions } from "../../security-core/core/internals/permissions/verifyPermissions.ts";

export class AuthAllowOnly {

    constructor() {
        Orange.setOptions(this, {
            hooks: {
                beforeEach: () => {
                    ApplicationContext.getInstance().getComponentsRegistry().clearComponentRegistry();
                }
            }
        })
    }

    @Test({
        name: "Test @AllowOnly decorator",
        description: "Should call proxy & add metadata to method or class"
    })
    public testAllowOnlyDecorator() {

        @mockDecorator()
        class MyController {

        }
        MVCDecoratorsProxy.registerControllerComponent(MyController, undefined);
        SecurityCoreDecoratorsProxy.registerAllowOnlyDecorator(MyController, ["ANY_PERMISSION", "isAuthenticated()"], <any><unknown>undefined);
        const controllerComponent = <ControllerComponent>ApplicationContext.getInstance().getComponentsRegistry().get("MyController")?.componentInstance;
        controllerComponent.initializeControllerFunctionality();
        DenoAsserts.assertEquals(controllerComponent.options.withPermissions, ["ANY_PERMISSION", "isAuthenticated()"]);
    }

    @Test({
        name: "Test @AllowOnly decorator in method",
        description: "Should add metadata to a route method in a controller"
    })
    public testAllowOnlyDecoratorMethod() {
        @mockDecorator()
        class MyControllerWithRoutes {

            @mockDecorator()
            @mockDecorator()
            public getRoute() {
            }
        }

        SecurityCoreDecoratorsProxy.registerAllowOnlyDecorator(MyControllerWithRoutes.prototype, ["MODERATOR", "ADMIN"], "getRoute");
        MVCDecoratorsProxy.registerHttpAction("/api-get-allow-only", MandarineMvc.HttpMethods.GET, MyControllerWithRoutes.prototype, "getRoute", <any><unknown>undefined);
        MVCDecoratorsProxy.registerControllerComponent(MyControllerWithRoutes, undefined);
        ApplicationContext.getInstance().getComponentsRegistry().initializeControllers();
        let actions: Map<String, Mandarine.MandarineMVC.Routing.RoutingAction> = ApplicationContext.getInstance().getComponentsRegistry().get("MyControllerWithRoutes")?.componentInstance.getActions();
        let getRouteHandler = actions.get("MyControllerWithRoutes.getRoute");
        DenoAsserts.assertEquals(getRouteHandler?.routingOptions?.withPermissions, ["MODERATOR", "ADMIN"]);
    }

    @Test({
        name: "Verify permissions",
        description: "Should verify multiple scenarios of permissions"
    })
    public verifyPermissions(Test: any) {
        const permisions = ["ADMIN", "MOD"];
        const mockRequest: any = {
            authentication: {
                AUTH_PRINCIPAL: {
                    roles: ["ADMIN", "MOD"]
                }
            }
        };

        const verifyPermissionTest1 = verifyPermissions( {...mockRequest})(permisions);
        DenoAsserts.assertEquals(verifyPermissionTest1, true);

        const verifyPermissionTest2 = verifyPermissions({...mockRequest, authentication: {
            AUTH_PRINCIPAL: {
                roles: ["MOD"]
            }
        }})(permisions);
        DenoAsserts.assertEquals(verifyPermissionTest2, true);

        const verifyPermissionTest3 = verifyPermissions({...mockRequest, authentication: {
            AUTH_PRINCIPAL: {
                roles: ["ADMIN"]
            }
        }})(permisions);
        DenoAsserts.assertEquals(verifyPermissionTest3, true);

        const verifyPermissionTest4 = verifyPermissions({...mockRequest, authentication: {
            AUTH_PRINCIPAL: {
                roles: ["USER"]
            }
        }})(permisions);
        DenoAsserts.assertEquals(verifyPermissionTest4, false);

        const verifyPermissionTest5 = verifyPermissions({...mockRequest, authentication: {
            AUTH_PRINCIPAL: {
                roles: ["USER", "MOD"]
            }
        }})(permisions);
        DenoAsserts.assertEquals(verifyPermissionTest5, true);

        const isAuthenticated = ["isAuthenticated()"];
        const verifyPermissionTest6 = verifyPermissions({...mockRequest, authentication: {
            AUTH_PRINCIPAL: {
                roles: ["USER"]
            }
        }})(isAuthenticated);
        DenoAsserts.assertEquals(verifyPermissionTest6, true);

        // @ts-ignore
        const verifyPermissionTest7 = verifyPermissions({authentication: undefined})(isAuthenticated);
        DenoAsserts.assertEquals(verifyPermissionTest7, false);

        const verifyPermissionTest8 = verifyPermissions({...mockRequest, authentication: {
            AUTH_PRINCIPAL: {
                roles: ["MOD"]
            }
        }})([...permisions, "isAuthenticated()"]);
        DenoAsserts.assertEquals(verifyPermissionTest8, true);

        // @ts-ignore
        const verifyPermissionTest9 = verifyPermissions({authentication: undefined})([...permisions, "isAuthenticated()"]);
        DenoAsserts.assertEquals(verifyPermissionTest9, false);

        const verifyPermissionTest10 = verifyPermissions({...mockRequest})(["hasRole('ADMIN')"]);
        DenoAsserts.assertEquals(verifyPermissionTest10, true);

        const verifyPermissionTest11 = verifyPermissions({...mockRequest})(["hasRole('ADMIN') && isAuthenticated()"]);
        DenoAsserts.assertEquals(verifyPermissionTest11, true);

        const verifyPermissionTest12 = verifyPermissions({...mockRequest})(["hasRole('LOL') || isAuthenticated()"]);
        DenoAsserts.assertEquals(verifyPermissionTest12, true);

        // @ts-ignore
        const verifyPermissionTest13 = verifyPermissions({authentication: undefined })(["hasRole('LOL') || isAuthenticated()"]);
        DenoAsserts.assertEquals(verifyPermissionTest13, false);
    }

    @Test({
        name: "Verify permission with security expression",
        description: "Verify an expression that contains built-in methods"
    })
    public securityexpressiontest() {
        const mockRequest: any = {
            authentication: {
                AUTH_PRINCIPAL: {
                    roles: ["ADMIN", "MOD"]
                }
            }
        };

        const expr1 = verifyPermissions(mockRequest)("true AND hasRole('MOD')");
        DenoAsserts.assertEquals(expr1, true);

        const expr2 = verifyPermissions(mockRequest)("hasRole('MOD')");
        DenoAsserts.assertEquals(expr2, true);

        const expr3 = verifyPermissions(mockRequest)("hasRole(ADMIN)");
        DenoAsserts.assertEquals(expr3, true);

        const expr4 = verifyPermissions(<any>{})("hasRole(ADMIN)");
        DenoAsserts.assertEquals(expr4, false);

        // @ts-ignore
        const expr5 = verifyPermissions({ authentication: undefined })("hasRole(ADMIN)");
        DenoAsserts.assertEquals(expr5, false);

        const expr6 = verifyPermissions(mockRequest)("hasRole(ADMIN) && isAuthenticated()");
        DenoAsserts.assertEquals(expr6, true);

        const expr7 = verifyPermissions(mockRequest)("hasRole(ADMIN) && isAuthenticated() OR true");
        DenoAsserts.assertEquals(expr7, true);
    }
}