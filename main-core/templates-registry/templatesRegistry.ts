import { Mandarine } from "../Mandarine.ns.ts";
import { MandarineException } from "../exceptions/mandarineException.ts";

export class TemplatesManager implements Mandarine.MandarineCore.ITemplatesManager {

    private templates: Map<string, Mandarine.MandarineMVC.TemplateEngine.Template> = new Map<string, Mandarine.MandarineMVC.TemplateEngine.Template>();

    public register(templatePath: string, engine?: Mandarine.MandarineMVC.TemplateEngine.Engines): void {
        if(engine == (null || undefined)) engine = Mandarine.MandarineMVC.TemplateEngine.Engines.EJS;

        let fullPath: string = this.getFullPath(templatePath);

        if(this.templates.get(fullPath) == (null || undefined)) {
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

    }

    public getTemplate(templatePath: string): Mandarine.MandarineMVC.TemplateEngine.Template {
        let fullPath: string = this.getFullPath(templatePath);
        return this.templates.get(fullPath);
    }

    public getFullPath(templatePath: string): string {
        let mandarineConfiguration = Mandarine.Global.getMandarineConfiguration();
        return `${mandarineConfiguration.mandarine.templateEngine.path}/${templatePath}`;
    }

}