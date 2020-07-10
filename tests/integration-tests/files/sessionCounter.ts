import { Controller } from "../../../mvc-framework/core/decorators/stereotypes/controller/controller.ts";
import { GET } from "../../../mvc-framework/core/decorators/stereotypes/controller/routingDecorator.ts";
import { Session, RequestParam } from "../../../mvc-framework/core/decorators/stereotypes/controller/parameterDecorator.ts";
import { MandarineCore } from "../../../mod.ts";

@Controller()
class TestController {

    @GET('/session-counter')
    public helloWorld(@RequestParam() request, @Session() session: any): object {
        if(session.times == undefined) session.times = 0;
        else session.times = session.times + 1;

        return {
            times: session.times,
            sessionId: `${request.sessionContext.sessionCookie.name}=${request.sessionContext.sessionCookie.value}`
        }
    }

}

new MandarineCore().MVC().run({ port: 8084 });