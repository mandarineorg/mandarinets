import { Mandarine } from "../main-core/Mandarine.ns.ts";
import { MandarineCore } from "../main-core/mandarineCore.ts";
import { Controller } from "../mvc-framework/core/decorators/stereotypes/controller/controller.ts";
import { RequestBody, RequestParam, ResponseParam } from "../mvc-framework/core/decorators/stereotypes/controller/parameterDecorator.ts";
import { POST } from "../mvc-framework/core/decorators/stereotypes/controller/routingDecorator.ts";
@Controller()
export class MyController {

    @POST('/test')
    public async handler(@RequestBody() myrequest: any) {
        console.log(myrequest);
    }

}

new MandarineCore().MVC().run();