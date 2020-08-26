import { Controller } from "../../../mvc-framework/core/decorators/stereotypes/controller/controller.ts";
import { GET } from "../../../mvc-framework/core/decorators/stereotypes/controller/routingDecorator.ts";
import { MandarineCore } from "../../../main-core/mandarineCore.ts";
import { Mandarine } from "../../../main-core/Mandarine.ns.ts";
import { Pipe } from "../../../mvc-framework/core/decorators/stereotypes/controller/pipeDecorator.ts";
import { QueryParam } from "../../../mvc-framework/core/decorators/stereotypes/controller/parameterDecorator.ts";
import { Component } from "../../../main-core/decorators/stereotypes/component/component.ts";

@Component()
export class MymathService implements Mandarine.Types.PipeTransform {

    public transform(value: any): any {
        return value * 10.5;
    }
 
}

@Controller()
export class MyController {
    @GET('/hello-world')
    public httpHandler(@Pipe([parseInt, MymathService]) @QueryParam('id') myPipe: number) {
        return {
            typeof: typeof myPipe,
            value: myPipe
        }
    }
}

new MandarineCore().MVC().run({ port: 5320 });