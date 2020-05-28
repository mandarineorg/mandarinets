import { Configuration } from "../main-core/decorators/stereotypes/configuration/configuration.ts";
import { Injectable } from "../main-core/dependency-injection/decorators/injectable.ts";
import { Service } from "../main-core/decorators/stereotypes/service/service.ts";
import { Controller } from "../mvc-framework/core/decorators/stereotypes/controller/controller.ts";
import { GET } from "../mvc-framework/core/decorators/stereotypes/controller/routingDecorator.ts";
import { MandarineMVC } from "../mvc-framework/mandarineMVC.ts";
import { Inject } from "../main-core/dependency-injection/decorators/Inject.ts";
import { Reflect } from "../main-core/reflectMetadata.ts";
import { ApplicationContext } from "../main-core/application-context/mandarineApplicationContext.ts";

@Service()
export class Service3 {

    public pi() {
        return 3.14;
    }

}
@Service()
export class Service2 {

    constructor(public readonly service3: Service3) {}
}


@Service()
export class Service1 {

    constructor(public readonly service2: Service2) {}

}


@Controller()
export class Controller1 {

    constructor(public readonly Service: Service1){}

    @GET('/test')
    public test(): number {
        return this.Service.service2.service3.pi();
    }

}

new MandarineMVC().run();