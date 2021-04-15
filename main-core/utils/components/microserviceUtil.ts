import { ApplicationContext } from "../../application-context/mandarineApplicationContext.ts";
import { ComponentComponent } from "../../components/component-component/componentComponent.ts";
import { Mandarine } from "../../Mandarine.ns.ts";

export class MicroserviceUtil {
    public static async mount(component: ComponentComponent) {
        const [created, microserviceItem]: [boolean, Mandarine.MandarineCore.MicroserviceItem] = await Mandarine.Global.getMicroserviceManager().create(component.getClassHandlerPrimitive(), component.configuration);

        ApplicationContext.getInstance().getComponentsRegistry().connectMicroserviceToProxy(component);

        if(created) {
            microserviceItem.worker.postMessage({
                cmd: "LISTEN",
                transporter: microserviceItem.microserviceConfiguration.transport,
                channels: component.configuration.channels
            });
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