// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { ApplicationContext } from "../../application-context/mandarineApplicationContext.ts";
import { ComponentComponent } from "../../components/component-component/componentComponent.ts";
import { Mandarine } from "../../Mandarine.ns.ts";

export class MicroserviceUtil {

    private static makeListeningCall(component: ComponentComponent, microserviceItem: Mandarine.MandarineCore.MicroserviceItem) {
        microserviceItem.worker.postMessage({
            cmd: "LISTEN",
            transporter: microserviceItem.microserviceConfiguration.transport,
            channels: component.configuration.channels
        });
    }

    public static async mount(component: ComponentComponent) {
        const [created, microserviceItem]: [boolean, Mandarine.MandarineCore.MicroserviceItem] = await Mandarine.Global.getMicroserviceManager().create(component.getClassHandlerPrimitive(), component.configuration);

        ApplicationContext.getInstance().getComponentsRegistry().connectMicroserviceToProxy(component);

        if(created) {
            this.makeListeningCall(component, microserviceItem);
        }
    }

    public static async mountFromExistent(microservice: Mandarine.MandarineCore.MicroserviceItem) {
        const componentRegistry = ApplicationContext.getInstance().getComponentsRegistry();
        const componentsRegistryContext = componentRegistry.getComponentByHandlerType(microservice.parentComponent);

        if(componentsRegistryContext && microservice.status === "Initialized") {
            const component = componentsRegistryContext.componentInstance;
            this.makeListeningCall(component, microservice);
            componentRegistry.connectMicroserviceToProxy(componentsRegistryContext.componentInstance);
        }
    }

    public static async unmount(component: ComponentComponent) {
        const microserviceManager = Mandarine.Global.getMicroserviceManager();
        const microserviceItem = microserviceManager.getByComponent(component);
        if(microserviceItem) {
            microserviceManager.deleteByHash(microserviceItem.hash);
        }
    }
}