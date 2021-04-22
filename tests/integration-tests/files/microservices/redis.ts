// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { Microservice, MSOnMessage } from "../../../../main-core/decorators/microservices/microservice.ts";
import { MandarineCore } from "../../../../main-core/mandarineCore.ts";
import { Microlemon } from "../../../../main-core/microservices/mod.ts";
import { Controller } from "../../../../mvc-framework/core/decorators/stereotypes/controller/controller.ts";
import { GET } from "../../../../mvc-framework/core/decorators/stereotypes/controller/routingDecorator.ts";


let [resolveScope, rejectScope]: [any, any] = [,,];

const createPromise = () => new Promise((resolve, reject) => {
    resolveScope = resolve;
    rejectScope = reject;
});

let promise = createPromise();

@Microservice({
    transporter: Microlemon.Transporters.REDIS,
    configuration: {
        transport: "REDIS",
        options: {
            host: "127.0.0.1"
        }
    },
    channels: ["myqueue"]
})
export class MicroserviceClass {

    @MSOnMessage()
    public getMessage(data: any) {
        resolveScope(data);
    }

}


@Controller()
class MicroserviceResult {

    @GET('/result')
    public async helloWorld(): Promise<any> {
        return await promise;
    }

}

new MandarineCore().MVC().run({ port: 6934 });