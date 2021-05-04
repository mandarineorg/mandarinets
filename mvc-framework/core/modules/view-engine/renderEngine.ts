// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { renderEjs } from "https://raw.githubusercontent.com/mandarineorg/mandarinets-modules/master/view-engine/1.1.1/lib/engines/ejs.ts";
// @ts-nocheck
import { renderHandlebars } from "https://raw.githubusercontent.com/mandarineorg/mandarinets-modules/master/view-engine/1.1.1/lib/engines/handlebars.ts";
import { Log } from "../../../../logger/log.ts";
import { ApplicationContext } from "../../../../main-core/application-context/mandarineApplicationContext.ts";
import { TemplateEngineException } from "../../../../main-core/exceptions/templateEngineException.ts";
import { Mandarine } from "../../../../main-core/Mandarine.ns.ts";
import { ViewModel } from "./viewModel.ts";

/**
 * This class executes the rendering of a template inside the templates container
 * This class contains all elements related to the execution of the template
 */
export class RenderEngineClass {

    public static logger: Log = Log.getLogger(RenderEngineClass);

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
                throw new TemplateEngineException(TemplateEngineException.INVALID_ENGINE);
                break;
        }

        let manual: boolean = renderData.options != undefined && renderData.options.manual == true;
        let customPath: boolean = renderData.options != undefined && renderData.options.customPath == true;

        let template: Mandarine.MandarineMVC.TemplateEngine.Template | undefined = templatesManager.getTemplate(renderData, customPath, manual);
        if(template == undefined) throw new TemplateEngineException(TemplateEngineException.INVALID_TEMPLATE_PROCESSING);
        
        return viewEngine(template.content, (model instanceof ViewModel) ? model.toObject() : model);
    }
}