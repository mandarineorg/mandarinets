// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { Microservice, MSOnMessage } from "../../../../main-core/decorators/microservices/microservice.ts";
import { Mandarine } from "../../../../main-core/Mandarine.ns.ts";
import { MandarineCore } from "../../../../main-core/mandarineCore.ts";
import { Microlemon } from "../../../../main-core/microservices/mod.ts";
import { Controller } from "../../../../mvc-framework/core/decorators/stereotypes/controller/controller.ts";
import { GET } from "../../../../mvc-framework/core/decorators/stereotypes/controller/routingDecorator.ts";

@Microservice({
    transporter: Microlemon.Transporters.AMQP,
    configuration: {
        transport: "AMQP",
        options: {
            host: "127.0.0.1",
            username: "guest",
            password: "guest"
        }
    },
    channels: ["myqueue"]
})
export class MicroserviceClass {

    @MSOnMessage()
    public getMessage(data: any) {
        //
    }

}


@Controller()
class MicroserviceResult {

    @GET('/result3')
    public async hello3(): Promise<any> {
        return Mandarine.MandarineCore.Internals.getTimersManager().timers;
    }

    @GET('/result2')
    public async helloWorld2(): Promise<any> {
        const microserviceManager = () => Mandarine.Global.getMicroserviceManager();

        let result: any = {};
        const getMicroservice = microserviceManager().getMicroservices()[0];
        if(getMicroservice) {
            result.wasMicroserviceFoundAfter60Seconds = true;
            let thirdIsHealthy = await microserviceManager().isHealthy(getMicroservice.hash);
            result.thirdMicroserviceHealthiness = thirdIsHealthy;
        }

        return result;
    }

    @GET('/result')
    public async helloWorld(): Promise<any> {
        const microserviceManager = () => Mandarine.Global.getMicroserviceManager();
        const activeMicroservices = microserviceManager().getMicroservices();

        let result: any = {};

        result.firstMicroserviceCount = activeMicroservices.length;

        if(activeMicroservices.length === 1) {
            let microservice = activeMicroservices[0];
            let isHealthy = await microserviceManager().isHealthy(microservice.hash);

            result.firstMicroserviceHealthiness = isHealthy;

            if(isHealthy === true) {
                microservice.worker.terminate();
                let secondIshealthy = await microserviceManager().isHealthy(microservice.hash);
                result.secondMicroserviceHealthiness = secondIshealthy;
            }
        }

        return result;
    }

}

new MandarineCore().MVC().run({ port: 6935 });