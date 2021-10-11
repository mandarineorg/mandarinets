// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { ApplicationContext } from "../../main-core/application-context/mandarineApplicationContext.ts";
import { Mandarine } from "../../main-core/Mandarine.ns.ts";
import type { ControllerComponent } from "../../mvc-framework/core/internal/components/routing/controllerContext.ts";
import { handleCors } from "../../mvc-framework/core/middlewares/cors/corsMiddleware.ts";
import { MVCDecoratorsProxy } from "../../mvc-framework/core/proxys/mvcCoreDecorators.ts";
import { MandarineMvc } from "../../mvc-framework/mandarine-mvc.ns.ts";
import { DenoAsserts, Orange, Test } from "../mod.ts";

export class CORSTest {

    constructor() {
        Orange.setOptions(this, {
            hooks: {
                beforeEach: () => ApplicationContext.getInstance().getComponentsRegistry().clearComponentRegistry()
            }
        })
    }

    @Test({
        name: "Test CORS inclusion (Class level)",
        description: "Creates a controller component with CORS config & test the request"
    })
    public testCORSClassLevel() {
        class MyController {

        }
        let cors = {
            origin: "https://stackoverflow.com",
            methods: ["POST", "GET"],
            allowedHeaders: ["allowed-header-1"],
            exposedHeaders: ["exposed-header-1"],
            credentials: false,
            maxAge: 0,
            optionsSuccessStatus: 200
        };

        MVCDecoratorsProxy.registerControllerComponent(MyController, undefined);
        MVCDecoratorsProxy.registerCORSMiddlewareDecorator(MyController, cors, <string><unknown>null);
        ApplicationContext.getInstance().getComponentsRegistry().initializeControllers();
        DenoAsserts.assertEquals(Mandarine.Global.getComponentsRegistry().get("MyController")?.componentInstance.options.cors, cors);
        cors.optionsSuccessStatus = 204;
        DenoAsserts.assertNotEquals(Mandarine.Global.getComponentsRegistry().get("MyController")?.componentInstance.options.cors, cors);
    }

    @Test({
        name: "Test CORS inclusion (Method level)",
        description: "Creates a controller component with a HTTP handlers with CORS & test the request"
    })
    public testCORSMethodLevel() {

        class MyController {
            public getRoute() {}
        }

        let cors = {
            origin: "https://stackoverflow.com",
            methods: ["POST", "GET"],
            allowedHeaders: ["allowed-header-1"],
            exposedHeaders: ["exposed-header-1"],
            credentials: false,
            maxAge: 0,
            optionsSuccessStatus: 200
        };

        MVCDecoratorsProxy.registerHttpAction("/api-get-6", MandarineMvc.HttpMethods.GET, MyController.prototype, "getRoute", <any><unknown>undefined);
        MVCDecoratorsProxy.registerCORSMiddlewareDecorator(MyController.prototype, cors, "getRoute");
        MVCDecoratorsProxy.registerControllerComponent(MyController, undefined);
        ApplicationContext.getInstance().getComponentsRegistry().resolveDependencies();
        ApplicationContext.getInstance().getComponentsRegistry().initializeControllers();
        let controller: ControllerComponent = ApplicationContext.getInstance().getComponentsRegistry().get("MyController")?.componentInstance;
        let actions: Map<String, Mandarine.MandarineMVC.Routing.RoutingAction> = controller.getActions();
        let action = actions.get(controller.getActionName("getRoute"));
        DenoAsserts.assertEquals(action?.routingOptions?.cors, cors);
        cors.optionsSuccessStatus = 204;
        DenoAsserts.assertNotEquals(action?.routingOptions?.cors, cors);


    }

    @Test({
        name: "Test CORS Middleware",
        description: "Simulates a request owned by CORS"
    })
    public testCORSMiddleware() {

        let cors = {
            origin: "https://stackoverflow.com",
            methods: ["POST", "GET"],
            allowedHeaders: ["allowed-header-1", "allowed-header-2"],
            exposedHeaders: ["exposed-header-1", "exposed-header-2"],
            credentials: false,
            maxAge: 100,
            optionsSuccessStatus: 200
        };

        let requestMock = this.getMockObject("OPTIONS");

        requestMock.request.headers.set("access-control-request-method", "POST, DELETE, GET");
        requestMock.request.headers.set("access-control-request-headers", "Origin, allowed-header-1, Content-Type");

        requestMock.request.headers.set("origin", "http://localhost");
        handleCors(<any> requestMock, {
            corsOptions: cors,
            useDefaultCors: false
        });
        DenoAsserts.assertEquals(requestMock.response.headers.get("access-control-allow-origin"), false);
        DenoAsserts.assertEquals(requestMock.response.headers.get("access-control-allow-methods"), "POST, GET");
        DenoAsserts.assertEquals(requestMock.response.headers.get("access-control-allow-headers"), "allowed-header-1");
        DenoAsserts.assertEquals(requestMock.response.headers.get("access-control-expose-headers"), "exposed-header-1, exposed-header-2");
        DenoAsserts.assert(requestMock.response.headers.get("access-control-allow-credentials") == undefined);
        DenoAsserts.assertEquals(requestMock.response.headers.get("access-control-max-age"), "100");

        // RESET 
        requestMock = this.getMockObject("GET");

        requestMock.request.headers.set("origin", "http://localhost");
        handleCors(<any> requestMock, {
            corsOptions: cors,
            useDefaultCors: false
        });
        DenoAsserts.assertEquals(requestMock.response.headers.get("access-control-allow-origin"), false);
        DenoAsserts.assertEquals(requestMock.response.headers.get("access-control-expose-headers"), "exposed-header-1, exposed-header-2");
        DenoAsserts.assert(requestMock.response.headers.get("access-control-allow-credentials") == undefined);

        //RESET
        requestMock = this.getMockObject("GET");

        cors.credentials = true;
        cors.origin = "http://localhost";
        requestMock.request.headers.set("origin", "http://localhost");
        handleCors(<any> requestMock, {
            corsOptions: cors,
            useDefaultCors: false
        });
        DenoAsserts.assertEquals(requestMock.response.headers.get("access-control-allow-origin"), "http://localhost");
        DenoAsserts.assertEquals(requestMock.response.headers.get("access-control-expose-headers"), "exposed-header-1, exposed-header-2");
        DenoAsserts.assertEquals(requestMock.response.headers.get("access-control-allow-credentials"), "true");

        //RESET
        requestMock = this.getMockObject("GET");

        cors.origin = "*";
        handleCors(<any> requestMock, {
            corsOptions: cors,
            useDefaultCors: false
        });
        DenoAsserts.assertEquals(requestMock.response.headers.get("access-control-allow-origin"), "*");

        // RESET
        requestMock = this.getMockObject("OPTIONS");

        cors.maxAge = <number> <unknown> undefined;
        requestMock.request.headers.set("origin", "http://localhost");
        handleCors(<any> requestMock, {
            corsOptions: cors,
            useDefaultCors: false
        });
        DenoAsserts.assertEquals(requestMock.response.headers.get("access-control-max-age"), "0");
    }


    @Test({
        name: "Test CORS Middleware: HTTP header names are case insensitive",
        description: "HTTP header names must be treated in a case insensitive manner as per https://www.w3.org/Protocols/rfc2616/rfc2616-sec4.html#sec4.2"
    })
    public testCORSMiddlewareHttpHeadersCaseInsensitive(): void {

        [
            {
                requestHeadersName: "access-control-request-headers",
                requestHeadersValue: "Allowed-Header",
                allowedHeadersValue: "allowed-header"
            },
            {
                requestHeadersName: "Access-Control-Request-Headers",
                requestHeadersValue: "allowed-header",
                allowedHeadersValue: "Allowed-Header"
            }
        ].forEach((testFixture) => {
            const {requestHeadersName, requestHeadersValue, allowedHeadersValue} = testFixture;

            let corsOptions = {
                origin: "https://stackoverflow.com",
                allowedHeaders: [allowedHeadersValue],
            };
            let requestMock = this.getMockObject("OPTIONS");
            requestMock.request.headers.set("origin", "https://stackoverflow.com");
            requestMock.request.headers.set(requestHeadersName, requestHeadersValue);

            handleCors(<any> requestMock, {
                corsOptions,
                useDefaultCors: false
            });

            DenoAsserts.assertEquals(requestMock.response.headers.has("access-control-allow-headers"), true);
            DenoAsserts.assertEquals(requestMock.response.headers.get("access-control-allow-headers"), "allowed-header");
        })
    }


    public getMockObject(method: string) {
        return {
            request: {
                method: method,
                headers: new Headers([])
            },
        response: {
            headers: new Map<string, any>()
            }
        };
    }
}