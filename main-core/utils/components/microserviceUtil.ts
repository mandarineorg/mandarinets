import { ApplicationContext } from "../../application-context/mandarineApplicationContext.ts";
import { ComponentComponent } from "../../components/component-component/componentComponent.ts";
import { Mandarine } from "../../Mandarine.ns.ts";
import { MicroserviceManager } from "../../microservices/microserviceManager.ts";

export class MicroserviceUtil {
    public static async mount(component: ComponentComponent, microserviceManager: MicroserviceManager) {
        const [created, microserviceItem]: [boolean, Mandarine.MandarineCore.MicroserviceItem] = await microserviceManager.create(component.getClassHandlerPrimitive(), component.configuration);

        ApplicationContext.getInstance().getComponentsRegistry().connectMicroserviceToProxy(component);

        if(created) {
            microserviceItem.worker.postMessage({
                cmd: "LISTEN",
                transporter: microserviceItem.microserviceConfiguration.transport,
                channels: component.configuration.channels
            });
        }
    }
}