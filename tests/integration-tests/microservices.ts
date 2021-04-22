// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import {DenoAsserts, INTEGRATION_TEST_FILES_TO_RUN_DIRECTORY, Orange, Test, waitForMandarineServer} from "../mod.ts";
import {CommonUtils} from "../../main-core/utils/commonUtils.ts";
import { Microlemon } from "../../main-core/microservices/mod.ts";

export class MicroserviceTest {

    constructor() {
        Orange.setOptions(this, {
            hooks: {
                beforeEach: () => CommonUtils.sleep(2)
            }
        })
    }

    private async sendRabbitMQMessage() {
        const amqpClient = new Microlemon();
        const lol = await amqpClient.connect({
            transport: "AMQP",
            options: {
                host: "127.0.0.1",
                username: "guest",
                password: "guest",
                heartbeatInterval: undefined,
                loglevel: "none",
                vhost: "/",
                frameMax: undefined
            }
        });
        const channel = await lol.getSubscriber().openChannel();
        const queueName = "myqueue";
        await channel.declareQueue({ queue: queueName });
        await channel.publish(
        { routingKey: queueName },
        { contentType: "application/json" },
        new TextEncoder().encode(JSON.stringify({ foo: "bars" })),
        );
        await lol.getSubscriber().close();
    }

    @Test({
        name: "Test RabbitMQ Microservice `files/microservices/rabbitMq.ts`",
        description: "Test Sending & receiving a message on Microservice"
    })
    public async testRabbitMQMicroservice() {
        let cmd = await waitForMandarineServer("microservices/rabbitMq.ts");

        await this.sendRabbitMQMessage();
        Deno.sleepSync(2000);
        let { data } = (await (await fetch("http://localhost:6932/result")).json());

        try {
            DenoAsserts.assert(data !== null);
            DenoAsserts.assert(data !== undefined);
    
            const response = new TextDecoder().decode(new Uint8Array(Object.values(data)));

            DenoAsserts.assertEquals(response, `{"foo":"bars"}`);
        } finally {
            cmd.close();
        }
    }
}
