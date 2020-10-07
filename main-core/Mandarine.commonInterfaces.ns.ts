// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import type { Mandarine } from "./Mandarine.ns.ts";
import type { ComponentComponent } from "./components/component-component/componentComponent.ts";

export namespace MandarineCommonInterfaces {

    /**
     * Implementation for a Mandarine-powered component which will behave as a pipe
     */
    export interface PipeTransform {
        transform: (value: any) => any;
    }

    /**
     * Array containing a group of elements of `Mandarine.Types.PipeTransform` or A single `PipeTransform` element.
     */
    export type Pipes = Array<PipeTransform> | PipeTransform;

    /**
     * A component stereotype which extends to `Mandarine.Components.MiddlewareComponent`
     */
    export type MiddlewareComponent = ComponentComponent & Mandarine.Components.MiddlewareComponent;

    /**
     * A component stereotype which extends to `Mandarine.Components.CatchComponent`
     */
    export type CatchComponent = ComponentComponent & Mandarine.Components.CatchComponent;

    /**
     * A Mandarine-typed request context which comes down from the Oak Context
     */
    export type RequestContext = Mandarine.MandarineMVC.RequestContext;

    /**
     * An accessor to the information of the context.
     * @method `getFullContext()` @returns `Mandarine.Types.RequestContext`
     * @method `getRequest()` @returns `Mandarine.Types.RequestDataContext`
     * @method `getResponse()` @returns `Mandarine.Types.ResponseContext`
     */
    export type RequestContextAcessor = Mandarine.MandarineMVC.RequestContextAccessor;

    /**
     * Main interface for Mandarine built-in authentication.
     * This interface contains the required fields for the built-in authentication to validate
     */
    export type UserDetails = Mandarine.Security.Auth.UserDetails;

    /**
     * Main interface for Mandarine built-in authentication validator.
     * Through a service that implements this interface, Mandarine is capable of executing the logic of retrieving the requested user
     */
    export type UserDetailsService = Mandarine.Security.Auth.UserDetailsService;

    /**
     * Contains the information from Mandarine plugged in the Oak Request.
     * This additional data complements the Oak request & is used internally for and by Mandarine.
     */
    export type CurrentRequest = Mandarine.MandarineMVC.RequestDataContext;

    /**
     * Typed mirror of Oak Request. Shortcut access.
     */
    export type CurrentResponse = Mandarine.MandarineMVC.ResponseContext;
}