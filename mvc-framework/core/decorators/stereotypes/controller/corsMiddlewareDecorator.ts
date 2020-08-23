// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { Mandarine } from "../../../../../main-core/Mandarine.ns.ts";
import { MVCDecoratorsProxy } from "../../../proxys/mvcCoreDecorators.ts";

export const Cors = (corsOptions: Mandarine.MandarineMVC.CorsMiddlewareOption): Function => {
    return (target: any, methodName?: string) => {
        MVCDecoratorsProxy.registerCORSMiddlewareDecorator(target, corsOptions, methodName);
    };
}