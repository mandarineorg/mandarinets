import { Microlemon, Transporters, ConnectionData } from "https://deno.land/x/microlemon@v2.0.2/mod.ts";

declare const self: any;

let microserviceConnection: Microlemon | undefined = undefined;

const buildPostMessage = (data: { message: object | string, [prop: string]: any }): string => {
    return JSON.stringify(data);
}

const initializeMicroservice = async  (configuration: ConnectionData) => {
    if(!microserviceConnection) {
        try {
            microserviceConnection = (await (new Microlemon()).connect(configuration));
            self.postMessage(buildPostMessage({
                message: "MANDARINE_MICROSERVICE_READY"
            }));
        } catch (error) {
            self.postMessage(buildPostMessage({
                message: "MANDARINE_MICROSERVICE_FAILURE",
                data: error
            }))
        }
    }
}

const subscribeAndListen = async (subscription: { transporter: Transporters, channels: Array<string> }) => {
    try {
        if(microserviceConnection) {
            switch(subscription.transporter.toUpperCase()) {
                case Transporters.AMQP:
                    (async () => {
                        for await (const data of microserviceConnection.receive(subscription.channels[0])) {
                        self.postMessage(buildPostMessage(data));
                        }
                    })();
                break;
                case Transporters.REDIS:
                    const subscriber = await microserviceConnection.getSubscriber().channelSubscribe(...subscription.channels);
                    (async function () {
                    for await (const { channel, message } of subscriber.receive()) {
                        self.postMessage(buildPostMessage({
                            channel: channel,
                            message: message
                        }));
                    }
                    })();
                break;
                case Transporters.NATS:
                    const natsSubscriber = microserviceConnection.getSubscriber();
                    const [channelToSubscribe, queueGroup] = subscription.channels;
                    await natsSubscriber.subscribe(channelToSubscribe, queueGroup);
                    (async function () {
                    for await (const data of natsSubscriber.receive()) {
                        self.postMessage(buildPostMessage(data))
                    }
                    })();
                break;
            }
        }
    } catch (error) {
        await self.postMessage(buildPostMessage({
            mandarine: "LISTENING-ERROR",
            message: error.message
        }));
    }
}

// @ts-ignore
self.onmessage = async ({ data }) => {
    const cmdObject = data;

    switch(cmdObject.cmd) {
        case "INITIALIZE":
            await initializeMicroservice(cmdObject.configuration);
        break;
        case "LISTEN":
            await subscribeAndListen(data);
        break;
        case "HEALTH":
            await self.postMessage(buildPostMessage({
                mandarine: "HEALTH-CHECK",
                message: "ALIVE"
            }))
        break;
    }

}