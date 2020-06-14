import { Controller } from "../mvc-framework/core/decorators/stereotypes/controller/controller.ts";
import { Cors } from "../mvc-framework/core/decorators/stereotypes/controller/corsMiddlewareDecorator.ts";
import { GET } from "../mvc-framework/core/decorators/stereotypes/controller/routingDecorator.ts";
import { MandarineCore } from "../main-core/mandarineCore.ts";

@Controller('/api')
@Cors({
    origin: "https://stackoverflow.com"
})
export class MyApi {

    @GET('/hello')
    public handler() {
        return "hello";
    }

}

@Controller('/api2')
export class MyApi2 {

    @GET('/hello')
    @Cors({
        origin: "https://stackoverflow.com"
    })
    public handler() {
        return "hello";
    }

    @GET('/hello2')
    @Cors({
        origin: "http://localhost"
    })
    public handler2() {
        return "hello2";
    }

    @GET('/hello3')
    public handler3() {
        return "hello3";
    }

}

new MandarineCore().MVC().run();