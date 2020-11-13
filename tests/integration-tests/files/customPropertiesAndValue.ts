// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { ConfigurationProperties } from "../../../main-core/decorators/configuration-readers/configurationProperties.ts";
import { Value } from "../../../main-core/decorators/configuration-readers/value.ts";
import { MandarineCore } from "../../../main-core/mandarineCore.ts";
import { Controller } from "../../../mvc-framework/core/decorators/stereotypes/controller/controller.ts";
import { GET } from "../../../mvc-framework/core/decorators/stereotypes/controller/routingDecorator.ts";

@Controller()
@ConfigurationProperties('./tests/integration-tests/files/customPropertiesConfig.json')
export class MyComponent {

    @Value('my.data.database')
    // @ts-ignore
    public myDatabase: string;

    @GET('/my-custom-config')
    public handler() {
        return this.myDatabase;
    }

}

new MandarineCore().MVC().run({ port: 7751 });