import { Configuration } from "../main-core/decorators/stereotypes/configuration/configuration.ts";
import { MandarineStorageHandler } from "../main-core/mandarine-native/sessions/mandarineDefaultSessionStore.ts";
import { Injectable } from "../main-core/dependency-injection/decorators/injectable.ts";
import { MandarineCore } from "../mod.ts";

@Configuration()
export class ConfigClass {

    @Injectable()
    public getSessionContainer() {
        return {
            rolling: true,
            store: new MandarineStorageHandler()
        };
    }

}

new MandarineCore().MVC().run();