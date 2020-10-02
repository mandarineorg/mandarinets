// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import type { Mandarine } from "../../Mandarine.ns.ts";

/**
   * Define the behavior of a user-side guard
   * The guard target will be called at the time of a request.
   * onGuard(requestContext, ...args) will be called before executing the endpoint.
   * 
   * If onGuard **returns false**, the endpoint's execution will be discarded.
   * In order to keep the execution cycle going, onGuard must return true.
   *
   *        export class MyGuard implements GuardTarget {
   *            onGuard(requestContext: Mandarine.Types.RequestContext) {
   *                console.log("onGuard() called");
   *                return true;
   *            }
   *        }
   *
   */
export interface GuardTarget {
  onGuard(requestContext: Mandarine.Types.RequestContext, ...args: Array<any>): boolean;
}

export type GuardTargetMethod = (requestContext: Mandarine.Types.RequestContext) => boolean;