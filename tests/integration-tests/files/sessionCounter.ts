// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { MandarineCore } from "../../../mod.ts";
import { Controller } from "../../../mvc-framework/core/decorators/stereotypes/controller/controller.ts";
import { RequestParam, Session } from "../../../mvc-framework/core/decorators/stereotypes/controller/parameterDecorator.ts";
import { GET } from "../../../mvc-framework/core/decorators/stereotypes/controller/routingDecorator.ts";

@Controller()
class TestController {

    @GET('/session-counter')
    public helloWorld(@RequestParam() request: any, @Session() session: any): object {
        if(session.times == undefined) session.times = 0;
        else session.times = session.times + 1;

        return {
            times: session.times,
            sessionId: `${request.sessionContext.sessionCookie.name}=${request.sessionContext.sessionCookie.value}`
        }
    }

    @GET('/(.*)')
    public ok() {
        return "Ok";
    }
}

new MandarineCore().MVC().run({ port: 8085 });