// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { Log } from "../../logger/log.ts";
import type { ControllerComponent } from "../../mvc-framework/core/internal/components/routing/controllerContext.ts";
import { TemplateUtils } from "../../mvc-framework/core/utils/templateUtils.ts";
import { ApplicationContext } from "../application-context/mandarineApplicationContext.ts";
import { MandarineException } from "../exceptions/mandarineException.ts";
import { Mandarine } from "../Mandarine.ns.ts";
import { MandarineConstants } from "../mandarineConstants.ts";
import { Reflect } from "../reflectMetadata.ts";
import { ReflectUtils } from "../utils/reflectUtils.ts";
import { Leaf } from "../../deps.ts";

export class TemplatesManager implements Mandarine.MandarineCore.ITemplatesManager {

    private templates: Map<string, Mandarine.MandarineMVC.TemplateEngine.Template> = new Map<string, Mandarine.MandarineMVC.TemplateEngine.Template>();
    public logger: Log = Log.getLogger(TemplatesManager);

    public register(renderData: Mandarine.MandarineMVC.TemplateEngine.Decorators.RenderData, engine?: Mandarine.MandarineMVC.TemplateEngine.Engines): void {
        if(engine == (null || undefined)) engine = Mandarine.Global.getMandarineConfiguration().mandarine.templateEngine.engine;

        let manual: boolean = renderData.options != undefined && renderData.options.manual;

        if(!manual) {
            let fullPath: string = this.getFullPath(renderData.template);
            if(fullPath != (null || undefined)) {
                try {
                    let context: Mandarine.MandarineMVC.TemplateEngine.Template = {
                        templateFullPath: fullPath,
                        engine: <Mandarine.MandarineMVC.TemplateEngine.Engines>engine,
                        content: <string> (<unknown>undefined)
                    };

                    const decoder = new TextDecoder();
                    const templateContent = Leaf.readFileSync(fullPath);
                    context.content = decoder.decode(templateContent);

                    this.templates.set(fullPath, context);
                }catch(error) {
                    throw new MandarineException(MandarineException.INVALID_TEMPLATE.replace("%templatePath%", fullPath));
                }
            } else {
                throw new MandarineException(MandarineException.UNDEFINED_TEMPLATE);
            }
        } else {
            this.templates.set(TemplateUtils.getTemplateKey(renderData), {
                templateFullPath: <string> (<unknown>undefined),
                engine: <Mandarine.MandarineMVC.TemplateEngine.Engines>engine,
                content: renderData.template
            })
        }

    }

    public getTemplate(templatePath: Mandarine.MandarineMVC.TemplateEngine.Decorators.RenderData, customPath?: boolean, manual?: boolean): Mandarine.MandarineMVC.TemplateEngine.Template | undefined {
        let key: string;
        if(manual) {
            key = TemplateUtils.getTemplateKey(templatePath);
        } else {
            key = this.getFullPath((<Mandarine.MandarineMVC.TemplateEngine.Decorators.RenderData> templatePath).template, customPath);
        }
        return this.templates.get(key);
    }

    public getFullPath(templatePath: string, customPath: boolean = false): string {
        let mandarineConfiguration = Mandarine.Global.getMandarineConfiguration();
        return customPath === true ? templatePath : `${mandarineConfiguration.mandarine.templateEngine.path}/${templatePath}`;
    }

    public initializeTemplates(): void {
        ApplicationContext.getInstance().getComponentsRegistry()
        .getControllers()
        .map((item) => <ControllerComponent> item.componentInstance)
        .map((controller) => controller.getClassHandler())
        .forEach((controllerHandler) => {
            controllerHandler = (ReflectUtils.checkClassInitialized(controllerHandler)) ? controllerHandler : new controllerHandler();
            ReflectUtils.getMethodsFromClass(controllerHandler).forEach((methodName) => {
                let metadataKeysFromClass: Array<any> = Reflect.getMetadataKeys(controllerHandler, methodName);
                if(metadataKeysFromClass == (null || undefined)) return;
                let templateMetadataKeys: Array<any> = metadataKeysFromClass.filter((metadataKey: string) => metadataKey.startsWith(`${MandarineConstants.REFLECTION_MANDARINE_METHOD_ROUTE_RENDER}:`));
                if(templateMetadataKeys == (null || undefined)) return;
                templateMetadataKeys.forEach((value) => {
                    let annotationContext: Mandarine.MandarineMVC.TemplateEngine.Decorators.RenderData = <Mandarine.MandarineMVC.TemplateEngine.Decorators.RenderData> Reflect.getMetadata(value, controllerHandler, methodName);
                    ApplicationContext.getInstance().getTemplateManager().register(annotationContext, annotationContext.engine);
                });
            });
        });

        let numberOfTemplates: number = Array.from(this.templates.keys()).length;
        if(ApplicationContext.CONTEXT_METADATA.engineMetadata?.mvc?.templatesAmount) {
            ApplicationContext.CONTEXT_METADATA.engineMetadata.mvc.templatesAmount = numberOfTemplates;
        }
    }

}