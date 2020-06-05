import { Controller } from "../mvc-framework/core/decorators/stereotypes/controller/controller.ts";
import { GET } from "../mvc-framework/core/decorators/stereotypes/controller/routingDecorator.ts";
import { Render } from "../mvc-framework/core/decorators/stereotypes/view-engine/viewEngineDecorators.ts";
import { Model } from "../mvc-framework/core/decorators/stereotypes/controller/parameterDecorator.ts";
import { ViewModel } from "../mvc-framework/core/modules/view-engine/viewModel.ts";
import { MandarineCore, Mandarine } from "../mod.ts";

@Controller()
export class MyController {

    @GET('/path-template')
    @Render('mytemplate.html')
    public httpHandler(@Model() model: ViewModel) {

        model.setAttribute("data", {
            name: "Andres",
            lastname: "Pirela",
            address: {
                city: "New york",
                state: "NY",
                country: "United States"
            }
        });

        return model;
    }

    @GET('/manual-template')
    @Render(`<h2><%= name %></h2>`, { manual: true })
    public httpHandler2() {
        return {
            name: "Andres"
        };
    }

    @GET('/denjucks')
    @Render(`<p>Hello {{ txt }}</p>`, {manual: true}, Mandarine.MandarineMVC.TemplateEngine.Engines.DENJUCKS)
    public httpHandler3() {
        return {
            txt: "Andres"
        }
    }

    @GET('/denjucks-template-file')
    @Render('denjucks.html', {manual: false}, Mandarine.MandarineMVC.TemplateEngine.Engines.DENJUCKS)
    public httpHandler4() {
        return {
            txt: "Andres"
        }
    }

}

new MandarineCore().MVC().run();