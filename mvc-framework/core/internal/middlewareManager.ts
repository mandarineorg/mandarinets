// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { Mandarine } from "../../../main-core/Mandarine.ns.ts";
import { JsonUtils } from "../../../main-core/utils/jsonUtils.ts";

export class MiddlewareManager {

    private initialized: boolean = false;
    private internalMiddleware: Array<Mandarine.MandarineMVC.Internal.InternalMiddleware> = new Array<Mandarine.MandarineMVC.Internal.InternalMiddleware>();
    private middlewareMap: Map<Mandarine.MandarineMVC.Internal.InternalMiddlewareLifecycle, Array<Mandarine.MandarineMVC.Internal.InternalMiddleware>> = new Map();

    private initializeMiddlewareMap() {
        if(!this.initialized) {
            const configuration = Mandarine.Global.getMandarineConfiguration();

            this.middlewareMap.set("ALL", []);
            this.middlewareMap.set("PRE", []);
            this.middlewareMap.set("POST", []);

            this.internalMiddleware.forEach((middleware) => {
                const { key, expectedValue } = middleware.configurationFlag;
                const flagValue = JsonUtils.getValueFromObjectByDots(configuration, key);
                const isEnabled = flagValue === expectedValue && middleware.enabled;
                const lifecycle = middleware.lifecycle;

                if(isEnabled) {
                    this.middlewareMap.get(lifecycle)?.push(middleware);
                }
            });
            this.initialized = true;
        }
    }

    public new(obj: Mandarine.MandarineMVC.Internal.InternalMiddleware) {
        this.internalMiddleware.push(obj);
    }

    public get(type: Mandarine.MandarineMVC.Internal.MiddlewareType): Mandarine.MandarineMVC.Internal.InternalMiddleware | undefined {
        return this.internalMiddleware.find(x => x.type === type);
    }

    public execute(context: Mandarine.Types.RequestContext, data: any, lifecycle: Mandarine.MandarineMVC.Internal.InternalMiddlewareLifecycle) : boolean {
        this.initializeMiddlewareMap();

        return this.middlewareMap.get(lifecycle)!.every((middleware: Mandarine.MandarineMVC.Internal.InternalMiddleware) => {
            return middleware.caller(context, data);
        });
    }

}
