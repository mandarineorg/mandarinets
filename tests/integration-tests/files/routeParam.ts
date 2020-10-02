// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { MandarineCore } from "../../../main-core/mandarineCore.ts";
import { Controller } from "../../../mvc-framework/core/decorators/stereotypes/controller/controller.ts";
import { Parameters, RouteParam } from "../../../mvc-framework/core/decorators/stereotypes/controller/parameterDecorator.ts";
import { GET } from "../../../mvc-framework/core/decorators/stereotypes/controller/routingDecorator.ts";

@Controller()
class RouteParamControllerTest {

    @GET('/say-hi-1/:name')
    public helloWorld(@RouteParam('name') personsName: string): object {
        return {
            name: personsName
        };
    }

}

@Controller('/api')
class RouteParamControllerWithBaseTest {

    @GET('/say-hi-2/:personsName')
    public helloWorld2(@RouteParam() personsName: string): object {
        return {
            name: personsName
        };
    }

}

@Controller()
class RouteParamControllerTestWithUnknownRoute {

    @GET('/say-hi-3/:personsName')
    public helloWorld2(@RouteParam() whateverRoute: string): object {
        return {
            name: (whateverRoute) ? whateverRoute : "undefined"
        };
    }

}

@Controller()
class ControllerGetAllParameters {

    @GET('/parameters/:name/:lastname')
    public helloWorld2(@Parameters() allParameters: any) {
        return allParameters;
    }

}

new MandarineCore().MVC().run({ port: 8081 });