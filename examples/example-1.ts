import { Controller } from "../mvc-framework/core/decorators/stereotypes/controller/controller.ts";
import { GET } from "../mvc-framework/core/decorators/stereotypes/controller/routingDecorator.ts";
import { QueryParam, RouteParam } from "../mvc-framework/core/decorators/stereotypes/controller/parameterDecorator.ts";
import { MandarineMVC } from "../mvc-framework/mandarineMVC.ts";

@Controller()
class TestController {

    @GET('/sayHi')
    public helloWorld(@QueryParam('name') personsName: string): string {
        return `Hello ${personsName}, welcome to Mandarine.TS`;
    }

}

@Controller('/api')
export class Foo {
     
    @GET('/sayHi/:personsName')
    public helloWorld(@RouteParam() personsName: string): string {
        return `Hello ${personsName}, welcome to Mandarine.TS`;
    }

}

@Controller('/api')
export class Boo {
     
    @GET('/hello-world')
    public helloWorld(): string {
        return "Hello World";
    }

}

new MandarineMVC().run();