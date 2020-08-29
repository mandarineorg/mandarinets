// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { Mandarine } from "./Mandarine.ns.ts";
import { ComponentComponent } from "./components/component-component/componentComponent.ts";

export namespace MandarineCommonInterfaces {

    /**
     * Implementation for a Mandarine-powered component which will behave as a pipe
     */
    export interface PipeTransform {
        transform: (value: any) => any;
    }

    export type Pipes = Array<PipeTransform> | PipeTransform;
    export type MiddlewareComponent = ComponentComponent & Mandarine.Components.MiddlewareComponent;
    export type CatchComponent = ComponentComponent & Mandarine.Components.CatchComponent;
    export type RequestContext = Mandarine.MandarineMVC.RequestContext;
    export type RequestContextAcessor = Mandarine.MandarineMVC.RequestContextAccessor;
}