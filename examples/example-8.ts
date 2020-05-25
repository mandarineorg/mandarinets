import { Controller } from "../mvc-framework/core/decorators/stereotypes/controller/controller.ts";
import { GET } from "../mvc-framework/core/decorators/stereotypes/controller/routingDecorator.ts";
import { Render } from "../mvc-framework/core/decorators/stereotypes/view-engine/viewEngineDecorators.ts";
import { MandarineMVC } from "../mvc-framework/mandarineMVC.ts";
import { Model } from "../mvc-framework/core/decorators/stereotypes/controller/parameterDecorator.ts";
import { ViewModel } from "../mvc-framework/core/modules/view-engine/viewModel.ts";

@Controller('/templates')
export class MyController {

    @GET('/test')
    @Render('mytemplate.html')
    public handler(@Model() model: ViewModel) {

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

    @GET('/test2')
    @Render(`<h2><%= name %></h2>`, { manual: true })
    public handler2(@Model() model: ViewModel) {
        model.setAttribute("name", "Andres");
        return model;
    }

}

new MandarineMVC().run();