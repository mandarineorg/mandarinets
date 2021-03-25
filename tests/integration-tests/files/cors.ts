import {Controller} from "../../../mvc-framework/core/decorators/stereotypes/controller/controller.ts";
import {PUT} from "../../../mvc-framework/core/decorators/stereotypes/controller/routingDecorator.ts";
import {Cors} from "../../../mvc-framework/core/decorators/stereotypes/controller/corsMiddlewareDecorator.ts";
import {MandarineCore} from "../../../main-core/mandarineCore.ts";

@Controller()
export class MyController {

    @PUT('/default')
    @Cors({origin: 'http://localhost'})
    public default() {
        return "CORS-enabled PUT action"
    }
}

new MandarineCore().MVC().run({ port: 1228 });
