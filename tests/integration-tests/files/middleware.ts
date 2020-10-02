// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { Service } from "../../../main-core/decorators/stereotypes/service/service.ts";
import { MiddlewareTarget } from "../../../main-core/internals/interfaces/middlewareTarget.ts";
import { Middleware } from "../../../main-core/decorators/stereotypes/middleware/Middleware.ts";
import { Controller } from "../../../mvc-framework/core/decorators/stereotypes/controller/controller.ts";
import { UseMiddleware } from "../../../mvc-framework/core/decorators/stereotypes/controller/useMiddleware.ts";
import { GET } from "../../../mvc-framework/core/decorators/stereotypes/controller/routingDecorator.ts";
import { RequestParam } from "../../../mvc-framework/core/decorators/stereotypes/controller/parameterDecorator.ts";
import { MandarineCore } from "../../../main-core/mandarineCore.ts";

@Service()
export class MyService {
    public calculate() {
        return 5 + 5;
    }
}

@Middleware(new RegExp("/docs/(.*)"))
export class MyDocsMiddleware implements MiddlewareTarget {

    constructor(public readonly myService: MyService) {}

    public onPreRequest(@RequestParam() request: any) {
        request["TEST_MIDDLEWARE"] = `DOCS INTERCEPTION ${this.myService.calculate()}`;
        return true;
    }

    public onPostRequest() {
    }
}

@Middleware()
export class MyNonRegexMiddleware implements MiddlewareTarget {

    constructor(public readonly myService: MyService) {}

    public onPreRequest(@RequestParam() request: any) {
        request["TEST_MIDDLEWARE"] = `Hello ${this.myService.calculate()}`;
        return true;
    }

    public onPostRequest() {
    }
}


@Controller()
@UseMiddleware([MyNonRegexMiddleware])
export class MyController {

    @GET('/with-middleware-controller')
    public handler(@RequestParam() request: any) {
        return request;
    }

}


@Controller()
export class MyController2 {

    @GET('/with-middleware-method')
    @UseMiddleware([MyNonRegexMiddleware])
    public handler(@RequestParam() request: any) {
        return request;
    }

    @GET('/hello-world')
    public handler3(@RequestParam() request: any) {
        return request;
    }

    @GET('/docs/my-doc')
    public handler4(@RequestParam() request: any) {
        return request;
    }

    @GET('/docs-my-doc')
    public handler5(@RequestParam() request: any) {
        return request;
    }

}

export const nonComponentMiddlewareContinueFalse = {
    onPreRequest: (request: any, response: any) => {
        request["TEST_MIDDLEWARE_NONCOMPONENT"] = "Superman"
        response.body = {
            request: request,
            response: response
        }
        return false;
    },
    onPostRequest: (request: any, response: any) => {
    }
}

export const nonComponentMiddlewareContinueTrue = {
    onPreRequest: (request: any, response: any) => {
        request["TEST_MIDDLEWARE_NONCOMPONENT"] = "Batman"
        return true;
    },
    onPostRequest: (request: any, response: any) => {
    }
}

@Controller()
export class MyController3 {
    @GET('/api/get-4')
    @UseMiddleware([nonComponentMiddlewareContinueFalse, MyNonRegexMiddleware])
    public handler3(@RequestParam() request: any) {
        return request;
    }

    @GET('/api/get-5')
    @UseMiddleware([nonComponentMiddlewareContinueFalse])
    public handler5(@RequestParam() request: any) {
        return request;
    }

    @GET('/api/get-6')
    @UseMiddleware([])
    public handler6(@RequestParam() request: any) {
        return request;
    }

    @GET('/api/get-7')
    @UseMiddleware([nonComponentMiddlewareContinueTrue])
    public handler7(@RequestParam() request: any) {
        return request;
    }
}

new MandarineCore().MVC().run({ port: 2024 });