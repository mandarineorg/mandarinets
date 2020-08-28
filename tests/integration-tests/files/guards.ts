// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { Controller } from "../../../mvc-framework/core/decorators/stereotypes/controller/controller.ts";
import { GET } from "../../../mvc-framework/core/decorators/stereotypes/controller/routingDecorator.ts";
import { UseGuards } from "../../../mvc-framework/core/decorators/stereotypes/controller/useGuards.ts";
import { Guard } from "../../../main-core/decorators/stereotypes/guards/guard.ts";
import { GuardTarget, GuardTargetMethod } from "../../../main-core/internals/interfaces/guardTarget.ts";
import { Mandarine } from "../../../main-core/Mandarine.ns.ts";
import { MandarineCore } from "../../../main-core/mandarineCore.ts";

@Guard()
export class GuardComponent implements GuardTarget {

    onGuard(request: Mandarine.Types.RequestContext) {
        return request != undefined;
    }

}

export const falseGuard: GuardTargetMethod = (request) => {
    console.log(request);
    return false;
}

@Controller()
export class MyController {
    
    @GET('/hello-world')
    public handler() {
        return "Hello world";
    }

    @GET("/protected")
    @UseGuards([GuardComponent])
    public handler2() {
        return "Protection Passed";
    }

    @GET("/protected-2")
    @UseGuards([GuardComponent, falseGuard])
    public handler3() {
        return "Protection failed";
    }

}

@Controller()
@UseGuards([falseGuard])
export class MyControllerN2 {

    @GET('/hello-world-2')
    public handler() {
        return "Didnt Pass";
    }

}

@Controller()
@UseGuards([GuardComponent])
export class MyControllerN3 {

    @GET('/hello-world-3')
    public handler() {
        return "Passed";
    }

}


@Controller()
@UseGuards([falseGuard, GuardComponent])
export class MyControllerN4 {

    @GET('/hello-world-4')
    public handler() {
        return "Didnt Pass";
    }

}

new MandarineCore().MVC().run({ port: 7555 });