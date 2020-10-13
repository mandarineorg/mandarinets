import { Mandarine } from "../../../main-core/Mandarine.ns.ts";
import { NativeComponentsOverrideProxy } from "../../../main-core/proxys/nativeComponentsOverrideProxy.ts";
import { Test, DenoAsserts, Orange, mockDecorator, MockCookies } from "../../mod.ts";

export class Issue210Test {
    @Test({
        name: "Keys should be present in overriding even if they don't exist [Github: #210]",
        description: "Issue related to Github #210"
    })
    public testKeysIfNotPresent() {
        NativeComponentsOverrideProxy.MVC.changeSessionContainer(<any>{});

        let defaultContainer = Mandarine.Defaults.MandarineDefaultSessionContainer();
        let mandarineGlobal: Mandarine.Global.MandarineGlobalInterface  = Mandarine.Global.getMandarineGlobal();
        
        DenoAsserts.assert(mandarineGlobal.mandarineSessionContainer.keys !== undefined);
        DenoAsserts.assert(Array.isArray(mandarineGlobal.mandarineSessionContainer.keys))
        DenoAsserts.assert(mandarineGlobal.mandarineSessionContainer.keys.length >= 1);
    }
}