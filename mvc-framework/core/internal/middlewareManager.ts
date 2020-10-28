// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { Mandarine } from "../../../main-core/Mandarine.ns.ts";
import { JsonUtils } from "../../../main-core/utils/jsonUtils.ts";

// export class InternalMiddlewareBuilder {

//     private type: Mandarine.MandarineMVC.Internal.MiddlewareType | undefined;
//     private caller: Mandarine.MandarineMVC.Internal.InternalMiddlewareFunc | undefined;
//     private configurationFlags: Array<any> = new Array<any>();
//     private enabled: boolean = true;

//     constructor(type: Mandarine.MandarineMVC.Internal.MiddlewareType) {
//         this.type =  type;
//     }

//     public static create(type: Mandarine.MandarineMVC.Internal.MiddlewareType): InternalMiddlewareBuilder {
//         return new InternalMiddlewareBuilder(type);
//     }



// }

export class MiddlewareManager {

    private internalMiddleware: Array<Mandarine.MandarineMVC.Internal.InternalMiddleware> = new Array<Mandarine.MandarineMVC.Internal.InternalMiddleware>();

    public new(obj: Mandarine.MandarineMVC.Internal.InternalMiddleware) {
        this.internalMiddleware.push(obj);
    }

    public get(type: Mandarine.MandarineMVC.Internal.MiddlewareType): Mandarine.MandarineMVC.Internal.InternalMiddleware | undefined {
        return this.internalMiddleware.find(x => x.type === type);
    }

    public execute(context: Mandarine.Types.RequestContext, data: any, lifecycle: Mandarine.MandarineMVC.Internal.InternalMiddlewareLifecycle) : void {
        const configuration = Mandarine.Global.getMandarineConfiguration();

        this.internalMiddleware
        .filter(x => x.lifecycle === lifecycle || x.lifecycle === "ALL")
        .filter((middleware: Mandarine.MandarineMVC.Internal.InternalMiddleware) => {
            const { key, expectedValue } = middleware.configurationFlag;
            let flagValue = JsonUtils.getValueFromObjectByDots(configuration, key);
            return flagValue === expectedValue && middleware.enabled;
        })
        .forEach((middleware: Mandarine.MandarineMVC.Internal.InternalMiddleware) => {
            middleware.caller(context, data);
        });
    }

}
