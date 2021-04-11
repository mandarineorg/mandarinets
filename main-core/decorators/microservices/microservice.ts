import { Transporters, ConnectionData } from "https://deno.land/x/microlemon@v2.0.2/mod.ts";
import { MandarineException } from "../../exceptions/mandarineException.ts";
import { Mandarine } from "../../Mandarine.ns.ts";
import { MainCoreDecoratorProxy } from "../../proxys/mainCoreDecorator.ts";

export const Microservice = (configuration: { transporter: Transporters, configuration?: ConnectionData, channels: Array<string> }): Function => {
    return (target: any) => {
        const defaultMicroserviceConfig: { [prop: string]: any } | undefined = Mandarine.Global.readConfigByDots(`mandarine.microservices.${configuration.transporter.toLowerCase()}`);
        const configurationToUse = configuration.configuration || defaultMicroserviceConfig;

        if(!configurationToUse) throw new MandarineException(MandarineException.INVALID_MICROSERVICE_CONFIGURATION);

        //@ts-ignore
        configuration.configuration = configurationToUse;
        
        // @ts-ignore
        MainCoreDecoratorProxy.registerMandarinePoweredComponent(target, Mandarine.MandarineCore.ComponentTypes.MICROSERVICE, {...configuration.configuration, channels: configuration.channels }, null);
    }
};

export const MSOnOpen = (): Function => {
    return (target: any, methodName: string) => {
        MainCoreDecoratorProxy.registerWorkerProperty(target, "onOpen", methodName);
    }
}

export const MSOnClose = (): Function => {
    return (target: any, methodName: string) => {
        MainCoreDecoratorProxy.registerWorkerProperty(target, "onClose", methodName);
    }
}

export const MSOnError = (): Function => {
    return (target: any, methodName: string) => {
        MainCoreDecoratorProxy.registerWorkerProperty(target, "onError", methodName);
    }
}

export const MSOnMessage = (): Function => {
    return (target: any, methodName: string) => {
        MainCoreDecoratorProxy.registerWorkerProperty(target, "onMessage", methodName);
    }
}

export const MSClose = (): Function => {
    return (target: any, methodName: string) => {
        MainCoreDecoratorProxy.registerWorkerProperty(target, "close", methodName);
    }
}