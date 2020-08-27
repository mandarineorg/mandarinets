// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { Catch } from "../../../main-core/decorators/stereotypes/catch/catch.ts";
import { MandarineException } from "../../../main-core/exceptions/mandarineException.ts";
import { ExceptionFilter, ExceptionContext } from "../../../main-core/internals/interfaces/exceptionFilter.ts";
import { Controller } from "../../../mvc-framework/core/decorators/stereotypes/controller/controller.ts";
import { GET } from "../../../mvc-framework/core/decorators/stereotypes/controller/routingDecorator.ts";
import { MandarineCore } from "../../../main-core/mandarineCore.ts";

@Catch(MandarineException)
export class MyExceptionFilter implements ExceptionFilter<Error> {
    public async catch(exceptionContext: ExceptionContext) {
        exceptionContext.getResponse().body = {
            error: "A error has occured",
            msg: exceptionContext.getException().toString()
        }
    }
}

@Controller()
export class MyController {

    @GET('/throw')
    public throwError() {
        throw new Error("An error has been thrown");
    }

    @GET('/throw-2')
    public throwError2() {
        throw new MandarineException("An error has been thrown");
    }

    @GET('/do-not-throw')
    public dontThrow() {
        return "Hello world";
    }

}

new MandarineCore().MVC().run({ port: 2490 });