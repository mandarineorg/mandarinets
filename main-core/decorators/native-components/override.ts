// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import type { Mandarine } from "../../Mandarine.ns.ts";
import { MainCoreDecoratorProxy } from "../../proxys/mainCoreDecorator.ts";

export const Override = (type?: Mandarine.MandarineCore.NativeComponents) => {
    return (targetClass: any) => {
        MainCoreDecoratorProxy.overrideNativeComponent(targetClass, <Mandarine.MandarineCore.NativeComponents> type);
    }
};