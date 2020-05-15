import { Middleware } from "../main-core/decorators/stereotypes/middleware/Middleware.ts";
import { MiddlewareTarget } from "../main-core/components/middleware-component/middlewareTarget.ts";
import { Controller } from "../mvc-framework/core/decorators/stereotypes/controller/controller.ts";
import { GET } from "../mvc-framework/core/decorators/stereotypes/controller/routingDecorator.ts";
import { MandarineMVC } from "../mvc-framework/mandarineMVC.ts";
import { ResponseParam } from "../mvc-framework/core/decorators/stereotypes/controller/parameterDecorator.ts";

@Middleware(new RegExp('/api/*'))
export class Middleware1 implements MiddlewareTarget {

    public onPreRequest(@ResponseParam() response: any): boolean {
        // True = the request must continue, False = the request will stop
        return false;
    }

    public onPostRequest(): void {
    }
}

@Controller()
export class MyController {

    @GET('/api/helloWorld')
    public helloWorldApi() {
        return "Hello world from api endpoint";
    }

}

new MandarineMVC().run();