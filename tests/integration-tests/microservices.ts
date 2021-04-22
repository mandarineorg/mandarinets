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
        const amqpClient = new Microlemon.Microlemon();
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

    private async sendNATSMessage() {
        const natsClient = new Microlemon.Microlemon();
        const lol = await natsClient.connect({
            transport: "NATS",
            options: {
                host: "127.0.0.1",
                user: "guest",
                pass: "guest"
            }
        });

        await lol.getSubscriber().publish("myqueue", "My message");
        await lol.getConnection().close();
    }

    private async sendRedisMessage() {
        const redisClient = new Microlemon.Microlemon();
        const redisConn = await redisClient.connect({
            transport: "REDIS",
            options: {
                host: "127.0.0.1"
            }
        });
        
        // exec(command: string, ...args: (string | number)[])
        // @ts-ignore
        await redisConn.exec("PUBLISH", "myqueue", `Hello moderators`);
        await redisConn.closeConnection();
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


    @Test({
        name: "Test NATS Microservice `files/microservices/nats.ts`",
        description: "Test Sending & receiving a message on Microservice"
    })
    public async testNATSMicroservice() {
        const $NATS_VERSION = "v2.2.1";
        let natsServer = [
        "wget",
         `https://github.com/nats-io/nats-server/releases/download/${$NATS_VERSION}/nats-server-${$NATS_VERSION}-linux-amd64.zip`, 
         "-O", 
         "tmp.zip;",
         "unzip", "tmp.zip;",
         "mv", `nats-server-${$NATS_VERSION}-linux-amd64`, "nats-server;",
         "rm", "nats-server/README.md", "LICENSE;",
         "cd", "nats-server;",
         "./nats-server"];
        let githubCmd;
        if(Deno.env.get("GITHUB") === "true") {
            console.log(natsServer.join(" "));
            githubCmd = Deno.run({
                cmd: natsServer,
                stdout: "inherit",
                stderr: "inherit"
            });
        }

        let cmd = await waitForMandarineServer("microservices/nats.ts");
        Deno.sleepSync(3000);
        await this.sendNATSMessage();
        Deno.sleepSync(2000);
        let data = (await (await fetch("http://localhost:6933/result")).json());

        try {
            DenoAsserts.assert(data !== null);
            DenoAsserts.assert(data !== undefined);
            DenoAsserts.assertEquals(data.type, "MSG");
            DenoAsserts.assertEquals(data.header.subject, "myqueue");
            DenoAsserts.assertEquals(data.header.responseLength, 10);
            DenoAsserts.assertEquals(data.message, "My message");
        } finally {
            cmd.close();
            if(githubCmd) {
                githubCmd.close();
            }
        }
    }

    @Test({
        name: "Test REDIS Microservice `files/microservices/redis.ts`",
        description: "Test Sending & receiving a message on Microservice"
    })
    public async testREDISMicroservices() {
        let cmd = await waitForMandarineServer("microservices/redis.ts");
        Deno.sleepSync(3000);
        await this.sendRedisMessage();
        Deno.sleepSync(2000);

        try {
            let data = (await (await fetch("http://localhost:6934/result")).json());
            DenoAsserts.assert(data !== null);
            DenoAsserts.assert(data !== undefined);
            DenoAsserts.assertEquals(data.channel, "myqueue");
            DenoAsserts.assertEquals(data.message, "Hello moderators");
        } finally {
            cmd.close();
        }
    }
}
