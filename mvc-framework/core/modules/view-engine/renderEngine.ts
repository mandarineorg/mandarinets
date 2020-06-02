import { Mandarine } from "../../../../main-core/Mandarine.ns.ts";
import { renderEjs } from "https://deno.land/x/view_engine/lib/engines/ejs.ts";
import { renderHandlebars } from "https://deno.land/x/view_engine/lib/engines/handlebars.ts";
import { ApplicationContext } from "../../../../main-core/application-context/mandarineApplicationContext.ts";
import { ViewModel } from "./viewModel.ts";
import { TemplateEngineException } from "../../exceptions/templateEngineException.ts";

/**
 * This class executes the rendering of a template inside the templates container
 * This class contains all elements related to the execution of the template
 */
export class RenderEngineClass {
    public static render(renderData: Mandarine.MandarineMVC.TemplateEngine.Decorators.RenderData, engine: Mandarine.MandarineMVC.TemplateEngine.Engines, model: any): string {
        let templatesManager: Mandarine.MandarineCore.ITemplatesManager = ApplicationContext.getInstance().getTemplateManager();

        let viewEngine: Function;

        switch(engine) {
            case  Mandarine.MandarineMVC.TemplateEngine.Engines.EJS:
                viewEngine = renderEjs;
                break;
            case  Mandarine.MandarineMVC.TemplateEngine.Engines.HANDLEBARS:
                viewEngine = renderHandlebars;
                break;
            default:
                throw new TemplateEngineException(TemplateEngineException.INVALID_ENGINE, "RenderEngine");
                break;
        }

        let manual: boolean = renderData.options != undefined && renderData.options.manual == true;

        let template: Mandarine.MandarineMVC.TemplateEngine.Template = templatesManager.getTemplate(renderData, manual);
        if(template == undefined) throw new TemplateEngineException(TemplateEngineException.INVALID_TEMPLATE_PROCESSING, "RenderEngine");
        
        return viewEngine(template.content, (model instanceof ViewModel) ? model.toObject() : model);
    }
}