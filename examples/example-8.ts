import { Controller } from "../mvc-framework/core/decorators/stereotypes/controller/controller.ts";
import { GET } from "../mvc-framework/core/decorators/stereotypes/controller/routingDecorator.ts";
import { Render } from "../mvc-framework/core/decorators/stereotypes/view-engine/viewEngineDecorators.ts";
import { MandarineMVC } from "../mvc-framework/mandarineMVC.ts";
import { Model } from "../mvc-framework/core/decorators/stereotypes/controller/parameterDecorator.ts";
import { ViewModel } from "../mvc-framework/core/modules/view-engine/viewModel.ts";

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

}

new MandarineMVC().run();