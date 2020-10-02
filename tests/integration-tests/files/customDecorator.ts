// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { Controller } from "../../../mvc-framework/core/decorators/stereotypes/controller/controller.ts";
import { GET } from "../../../mvc-framework/core/decorators/stereotypes/controller/routingDecorator.ts";
import { MandarineCore } from "../../../main-core/mandarineCore.ts";
import { parameterDecoratorFactory } from "../../../mvc-framework/core/decorators/custom-decorators/decoratorsFactory.ts";

const myCustomDecorator = parameterDecoratorFactory((context: any, parameter: any) => {
    return parameter;
})

@Controller()
export class MyController {
    @GET('/hello-world')
    public httpHandler(@myCustomDecorator('HAHAHA OKEYYY ES OBER!') msg: string) {
        return msg;
    }
}

new MandarineCore().MVC().run({ port: 2193 });