import { Middleware } from "../main-core/decorators/stereotypes/middleware/Middleware.ts";
import { MiddlewareTarget } from "../main-core/components/middleware-component/middlewareTarget.ts";
import { Controller } from "../mvc-framework/core/decorators/stereotypes/controller/controller.ts";
import { GET } from "../mvc-framework/core/decorators/stereotypes/controller/routingDecorator.ts";
import { MandarineMVC } from "../mvc-framework/mandarineMVC.ts";

@Middleware(new RegExp('/api/*'))
export class Middleware1 implements MiddlewareTarget {

    public onPreRequest(): boolean {
        // False = the request will stop, True = the request will continue.
        return false;
    }

    public onPostRequest(): void {
    }
}

@Controller()
export class MyController {

    @GET('/helloWorld')
    public helloWorld() {
        return "Hello World";
    }

    @GET('/api/helloWorld')
    public helloWorldApi() {
        return "Hello world from api endpoint";
    }

}

new MandarineMVC().run();