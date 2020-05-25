import { Mandarine } from "../../../../../main-core/Mandarine.ns.ts";
import { RoutingUtils } from "../../../utils/mandarine/routingUtils.ts";

/**
 * **Decorator**
 * 
 * This decorator specifies that an HTTP Handler is meant to render a file.
 * `@Render(templatePath, engine)`
 * `Target: Method (Http Handler)`
 */
export const Render = (templatePath: string, engine?: Mandarine.MandarineMVC.TemplateEngine.Engines) => {
    return (target: any, methodName: string) => {
        RoutingUtils.registerRenderHandler(target, methodName, templatePath, engine);
    };
};