// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { Mandarine, MandarineCore } from "../../../mod.ts";
import { Controller } from "../../../mvc-framework/core/decorators/stereotypes/controller/controller.ts";
import { GET } from "../../../mvc-framework/core/decorators/stereotypes/controller/routingDecorator.ts";
import { Render } from "../../../mvc-framework/core/decorators/stereotypes/view-engine/viewEngineDecorators.ts";

@Controller()
export class MyController {

    @GET('/manual-template-ejs')
    @Render(`<h2><%= name %></h2>`, { manual: true })
    public httpHandler1() {
        return {
            name: "Will"
        };
    }

    @GET('/manual-template-handlebars')
    @Render(`<h1>{{ name }}</h1>`, { manual: true }, Mandarine.MandarineMVC.TemplateEngine.Engines.HANDLEBARS)
    public httpHandler2() {
        return {
            name: "Andres"
        };
    }

}

new MandarineCore().MVC().run({ port: 8090 });