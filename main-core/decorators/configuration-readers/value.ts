import { ComponentUtils } from "../../utils/componentUtils.ts";
import { MainCoreDecoratorProxy } from "../../proxys/mainCoreDecorator.ts";

/**
 * **Decorator**
 * Inject a value from the configuration file.
 *
 * `@Value('mandarine.server.host')`
 */
export const Value = (configKey: string): Function => {
    return (target: any, propertyName: string) => {
        MainCoreDecoratorProxy.valueDecorator(target, configKey, propertyName);
    }
};