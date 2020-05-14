import { Configuration } from "../main-core/decorators/stereotypes/configuration/configuration.ts";
import { Injectable } from "../main-core/dependency-injection/decorators/injectable.ts";
import { Service } from "../main-core/decorators/stereotypes/service/service.ts";
import { Controller } from "../mvc-framework/core/decorators/stereotypes/controller/controller.ts";
import { GET } from "../mvc-framework/core/decorators/stereotypes/controller/routingDecorator.ts";
import { MandarineMVC } from "../mvc-framework/mandarineMVC.ts";
import { Inject } from "../main-core/dependency-injection/decorators/Inject.ts";
import { Reflect } from "../main-core/reflectMetadata.ts";
import { ApplicationContext } from "../main-core/application-context/mandarineApplicationContext.ts";


export class ManualInjectionService {

    public name: string;

    constructor(name: string) {
        this.name = name;
    }

    public helloWorld(): string {
        return `hello ${this.name}`;
    }

}

@Service()
export class Service1 {

    @Inject()
    public service: ManualInjectionService;

    public getResult(): string {
        return this.service.helloWorld();
    }
}

@Configuration()
export class MainConfig {

    @Injectable()
    public ManualInjectionService() {
        return new ManualInjectionService("Andres");
    }

}

@Controller()
export class Controller1 {

    constructor(public readonly Service: Service1){}

    @GET('/testing-manual-injection')
    public test(): string {
        return this.Service.getResult();
    }

}

new MandarineMVC().run();