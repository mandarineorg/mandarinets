// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { Mandarine } from "../../../../../main-core/Mandarine.ns.ts";
import { MVCDecoratorsProxy } from "../../../proxys/mvcCoreDecorators.ts";

/**
 * **Decorator**
 * 
 * This decorator specifies that an HTTP Handler is meant to render a file.
 * `@Render(template, options, engine)`
 * `Target: Method (Http Handler)`
 */
export const Render = (template: string, options?: Mandarine.MandarineMVC.TemplateEngine.RenderingOptions, engine?: Mandarine.MandarineMVC.TemplateEngine.Engines) => {
    return (target: any, methodName: string) => {
        MVCDecoratorsProxy.registerRenderHandler(target, methodName, template, engine, options);
    };
};