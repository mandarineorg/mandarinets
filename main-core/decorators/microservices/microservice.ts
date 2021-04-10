import { Transporters, ConnectionData } from "https://deno.land/x/microlemon@v2.0.2/mod.ts";
import { MandarineException } from "../../exceptions/mandarineException.ts";
import { Mandarine } from "../../Mandarine.ns.ts";
import { MainCoreDecoratorProxy } from "../../proxys/mainCoreDecorator.ts";

export const Microservice = (configuration: { transporter: Transporters, configuration?: ConnectionData }): Function => {
    return (target: any) => {
        const defaultMicroserviceConfig: { [prop: string]: any } | undefined = Mandarine.Global.readConfigByDots(`mandarine.microservices.${configuration.transporter.toLowerCase()}`);
        const configurationToUse = configuration.configuration || defaultMicroserviceConfig;

        if(!configurationToUse) throw new MandarineException(MandarineException.INVALID_MICROSERVICE_CONFIGURATION);

        //@ts-ignore
        configuration.configuration = configurationToUse;
        
        // @ts-ignore
        MainCoreDecoratorProxy.registerMandarinePoweredComponent(target, Mandarine.MandarineCore.ComponentTypes.MICROSERVICE, configuration.configuration, null);
    }
};