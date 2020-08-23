// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { Test, DenoAsserts, Orange, mockDecorator, MockCookies } from "../mod.ts";
import { ApplicationContext } from "../../main-core/application-context/mandarineApplicationContext.ts";
import { MVCDecoratorsProxy } from "../../mvc-framework/core/proxys/mvcCoreDecorators.ts";
import { SecurityCoreDecoratorsProxy } from "../../security-core/core/proxys/securityCoreDecorators.ts";
import { ControllerComponent } from "../../mvc-framework/core/internal/components/routing/controllerContext.ts";
import { MandarineMvc } from "../../mvc-framework/mandarine-mvc.ns.ts";
import { Mandarine } from "../../main-core/Mandarine.ns.ts";
import { VerifyPermissions } from "../../security-core/core/internals/permissions/verifyPermissions.ts";

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
        SecurityCoreDecoratorsProxy.registerAllowOnlyDecorator(MyController, ["ANY_PERMISSION", "isAuthenticated()"], undefined);
        const controllerComponent = <ControllerComponent>ApplicationContext.getInstance().getComponentsRegistry().get("MyController").componentInstance;
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
        MVCDecoratorsProxy.registerHttpAction("/api-get", MandarineMvc.HttpMethods.GET, MyControllerWithRoutes.prototype, "getRoute", undefined);
        MVCDecoratorsProxy.registerControllerComponent(MyControllerWithRoutes, undefined);
        ApplicationContext.getInstance().getComponentsRegistry().initializeControllers();
        let actions: Map<String, Mandarine.MandarineMVC.Routing.RoutingAction> = ApplicationContext.getInstance().getComponentsRegistry().get("MyControllerWithRoutes").componentInstance.getActions();
        let getRouteHandler = actions.get("MyControllerWithRoutes.getRoute");
        DenoAsserts.assertEquals(getRouteHandler.routingOptions.withPermissions, ["MODERATOR", "ADMIN"]);
    }

    @Test({
        name: "Verify permissions",
        description: "Should verify multiple scenarios of permissions"
    })
    public verifyPermissions(Test) {
        const permisions = ["ADMIN", "MOD"];
        const mockRequest = {
            authentication: {
                AUTH_PRINCIPAL: {
                    roles: ["ADMIN", "MOD"]
                }
            }
        };

        const verifyPermissionTest1 = VerifyPermissions(permisions, {...mockRequest});
        DenoAsserts.assertEquals(verifyPermissionTest1, true);

        const verifyPermissionTest2 = VerifyPermissions(permisions, {...mockRequest, authentication: {
            AUTH_PRINCIPAL: {
                roles: ["MOD"]
            }
        }});
        DenoAsserts.assertEquals(verifyPermissionTest2, true);

        const verifyPermissionTest3 = VerifyPermissions(permisions, {...mockRequest, authentication: {
            AUTH_PRINCIPAL: {
                roles: ["ADMIN"]
            }
        }});
        DenoAsserts.assertEquals(verifyPermissionTest3, true);

        const verifyPermissionTest4 = VerifyPermissions(permisions, {...mockRequest, authentication: {
            AUTH_PRINCIPAL: {
                roles: ["USER"]
            }
        }});
        DenoAsserts.assertEquals(verifyPermissionTest4, false);

        const verifyPermissionTest5 = VerifyPermissions(permisions, {...mockRequest, authentication: {
            AUTH_PRINCIPAL: {
                roles: ["USER", "MOD"]
            }
        }});
        DenoAsserts.assertEquals(verifyPermissionTest5, true);

        const isAuthenticated = ["isAuthenticated()"];
        const verifyPermissionTest6 = VerifyPermissions(isAuthenticated, {...mockRequest, authentication: {
            AUTH_PRINCIPAL: {
                roles: ["USER"]
            }
        }});
        DenoAsserts.assertEquals(verifyPermissionTest6, true);

        const verifyPermissionTest7 = VerifyPermissions(isAuthenticated, {authentication: undefined});
        DenoAsserts.assertEquals(verifyPermissionTest7, false);

        const verifyPermissionTest8 = VerifyPermissions([...permisions, "isAuthenticated()"], {...mockRequest, authentication: {
            AUTH_PRINCIPAL: {
                roles: ["MOD"]
            }
        }});
        DenoAsserts.assertEquals(verifyPermissionTest8, true);

        const verifyPermissionTest9 = VerifyPermissions([...permisions, "isAuthenticated()"], {authentication: undefined});
        DenoAsserts.assertEquals(verifyPermissionTest9, false);

        const verifyPermissionTest10 = VerifyPermissions(["hasRole('ADMIN')"], {...mockRequest});
        DenoAsserts.assertEquals(verifyPermissionTest10, true);

        const verifyPermissionTest11 = VerifyPermissions(["hasRole('ADMIN') && isAuthenticated()"], {...mockRequest});
        DenoAsserts.assertEquals(verifyPermissionTest11, true);

        const verifyPermissionTest12 = VerifyPermissions(["hasRole('LOL') || isAuthenticated()"], {...mockRequest});
        DenoAsserts.assertEquals(verifyPermissionTest12, true);

        const verifyPermissionTest13 = VerifyPermissions(["hasRole('LOL') || isAuthenticated()"], {authentication: undefined});
        DenoAsserts.assertEquals(verifyPermissionTest13, false);
    }

    @Test({
        name: "Verify permission with security expression",
        description: "Verify an expression that contains built-in methods"
    })
    public securityexpressiontest() {
        const mockRequest = {
            authentication: {
                AUTH_PRINCIPAL: {
                    roles: ["ADMIN", "MOD"]
                }
            }
        };

        const expr1 = VerifyPermissions("true AND hasRole('MOD')", mockRequest);
        DenoAsserts.assertEquals(expr1, true);

        const expr2 = VerifyPermissions("hasRole('MOD')", mockRequest);
        DenoAsserts.assertEquals(expr2, true);

        const expr3 = VerifyPermissions("hasRole(ADMIN)", mockRequest);
        DenoAsserts.assertEquals(expr3, true);

        const expr4 = VerifyPermissions("hasRole(ADMIN)", {});
        DenoAsserts.assertEquals(expr4, false);

        const expr5 = VerifyPermissions("hasRole(ADMIN)", { authentication: undefined });
        DenoAsserts.assertEquals(expr5, false);

        const expr6 = VerifyPermissions("hasRole(ADMIN) && isAuthenticated()", mockRequest);
        DenoAsserts.assertEquals(expr6, true);

        const expr7 = VerifyPermissions("hasRole(ADMIN) && isAuthenticated() OR true", mockRequest);
        DenoAsserts.assertEquals(expr7, true);
    }
}