import { Mandarine } from "../Mandarine.ns.ts";
import { MandarineException } from "../exceptions/mandarineException.ts";
import { Sha256 } from "../../security-core/hash/sha256.ts";
import { TemplateUtils } from "../../mvc-framework/core/utils/templateUtils.ts";

export class TemplatesManager implements Mandarine.MandarineCore.ITemplatesManager {

    private templates: Map<string, Mandarine.MandarineMVC.TemplateEngine.Template> = new Map<string, Mandarine.MandarineMVC.TemplateEngine.Template>();

    public register(renderData: Mandarine.MandarineMVC.TemplateEngine.Decorators.RenderData, engine?: Mandarine.MandarineMVC.TemplateEngine.Engines): void {
        if(engine == (null || undefined)) engine = Mandarine.MandarineMVC.TemplateEngine.Engines.EJS;

        let manual: boolean = renderData.options != undefined && renderData.options.manual;

        if(!manual) {
            let fullPath: string = this.getFullPath(renderData.template);
            if(fullPath != (null || undefined)) {
                try {
                    let context: Mandarine.MandarineMVC.TemplateEngine.Template = {
                        templateFullPath: fullPath,
                        engine: engine,
                        content: undefined
                    };

                    const decoder = new TextDecoder();
                    const templateContent = Deno.readFileSync(fullPath);
                    context.content = decoder.decode(templateContent);

                    this.templates.set(fullPath, context);
                }catch(error) {
                    throw new MandarineException(MandarineException.INVALID_TEMPLATE.replace("%templatePath%", fullPath), "TemplateManager");
                }
            }
        } else {
            this.templates.set(TemplateUtils.getTemplateKey(renderData), {
                templateFullPath: undefined,
                engine: engine,
                content: renderData.template
            })
        }

    }

    public getTemplate(templatePath: string, manual?: boolean): Mandarine.MandarineMVC.TemplateEngine.Template {
        let key: string;
        if(manual) {
            key = templatePath;
        } else {
            key = this.getFullPath(templatePath);
        }
        return this.templates.get(key);
    }

    public getFullPath(templatePath: string): string {
        let mandarineConfiguration = Mandarine.Global.getMandarineConfiguration();
        return `${mandarineConfiguration.mandarine.templateEngine.path}/${templatePath}`;
    }

}