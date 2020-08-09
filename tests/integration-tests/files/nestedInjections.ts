// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { Service } from "../../../main-core/decorators/stereotypes/service/service.ts";
import { Controller } from "../../../mvc-framework/core/decorators/stereotypes/controller/controller.ts";
import { GET } from "../../../mvc-framework/core/decorators/stereotypes/controller/routingDecorator.ts";
import { MandarineCore } from "../../../mod.ts";

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

new MandarineCore().MVC().run({ port: 8083 });