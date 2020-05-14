import { Configuration } from "../main-core/decorators/stereotypes/configuration/configuration.ts";
import { Injectable } from "../main-core/dependency-injection/decorators/injectable.ts";
import { Service } from "../main-core/decorators/stereotypes/service/service.ts";
import { Controller } from "../mvc-framework/core/decorators/stereotypes/controller/controller.ts";
import { GET } from "../mvc-framework/core/decorators/stereotypes/controller/routingDecorator.ts";
import { MandarineMVC } from "../mvc-framework/mandarineMVC.ts";
import { Inject } from "../main-core/dependency-injection/decorators/Inject.ts";


export class ManualInjectionService {

    public name: string;

    constructor(name: string) {
        this.name = name;
    }

    public helloWorld(): string {
        return `hello ${this.name}`;
    }

}

@Configuration()
export class MainConfig {

    @Injectable()
    public getManualInjectionService() {
        return new ManualInjectionService("Andres");
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

@Controller()
export class Controller1 {

    constructor(public readonly Service: Service1){}

    @GET('/testing-manual-injection')
    public test() {
        return this.Service.getResult();
    }

}

new MandarineMVC().run();