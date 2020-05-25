import { Mandarine } from "../../../../main-core/Mandarine.ns.ts";
import { engineFactory, Engine } from "https://deno.land/x/view_engine/mod.ts";
import { TemplatesManager } from "../../../../main-core/templates-registry/templatesRegistry.ts";
import { ApplicationContext } from "../../../../main-core/application-context/mandarineApplicationContext.ts";
import { ViewModel } from "./viewModel.ts";
import { TemplateEngineException } from "../../exceptions/templateEngineException.ts";
import { Sha256 } from "../../../../security-core/hash/sha256.ts";
import { TemplateUtils } from "../../utils/templateUtils.ts";

/**
 * This class executes the rendering of a template inside the templates container
 * This class contains all elements related to the execution of the template
 */
export class RenderEngine {
    public static render(renderData: Mandarine.MandarineMVC.TemplateEngine.Decorators.RenderData, engine: Mandarine.MandarineMVC.TemplateEngine.Engines, model: any): string {
        let templatesManager: Mandarine.MandarineCore.ITemplatesManager = ApplicationContext.getInstance().getTemplateManager();

        let viewEngine: Engine;

        switch(engine) {
            case  Mandarine.MandarineMVC.TemplateEngine.Engines.EJS:
                viewEngine = engineFactory.getEjsEngine();
                break;
            case  Mandarine.MandarineMVC.TemplateEngine.Engines.HANDLEBARS:
                viewEngine = engineFactory.getHandlebarsEngine();
                break;
            default:
                // TODO THROW ERROR
                break;
        }

        let manual: boolean = renderData.options != undefined && renderData.options.manual == true;

        let template: Mandarine.MandarineMVC.TemplateEngine.Template = templatesManager.getTemplate(TemplateUtils.getTemplateKey(renderData), manual);
        if(template == undefined) throw new TemplateEngineException(TemplateEngineException.INVALID_TEMPLATE_PROCESSING, "RenderEngine");
        
        return viewEngine(template.content, (model instanceof ViewModel) ? model.toObject() : model);
    }
}