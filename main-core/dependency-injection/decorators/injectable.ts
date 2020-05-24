import { ApplicationContext } from "../../application-context/mandarineApplicationContext.ts";
import { Mandarine } from "../../Mandarine.ns.ts";

/**
 * **Decorator**
 * 
 * Defines a manual injection for non-mandarine components.
 * https://github.com/mandarineorg/mandarinets/wiki/Manual-Components
 *
 * `@Injectable()
 *  Target: method`
 */
export const Injectable = () => {
    return (target: any, methodName: string) => {
        let componentExist: boolean = ApplicationContext.getInstance().getComponentsRegistry().exist(methodName);

        if(!componentExist) {
            ApplicationContext.getInstance().getComponentsRegistry().register(methodName, target[methodName](), Mandarine.MandarineCore.ComponentTypes.MANUAL_COMPONENT, {});
        }
    }
}