import { Controller } from "../mvc-framework/core/decorators/stereotypes/controller/controller.ts";
import { POST } from "../mvc-framework/core/decorators/stereotypes/controller/routingDecorator.ts";
import { RequestBody } from "../mvc-framework/core/decorators/stereotypes/controller/parameterDecorator.ts";
import { MandarineCore } from "../main-core/mandarineCore.ts";
import { FormDataReader } from "../deps.ts";

@Controller()
export class MyController {

    @POST('/test')
    public handler(@RequestBody() myrequest: any) {
        //return myrequest.value.read();
    }

}

new MandarineCore().MVC().run();