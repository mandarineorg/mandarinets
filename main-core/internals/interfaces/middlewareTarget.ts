// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

/**
   * Define the behavior of a user-side middleware
   * The middleware target will be called at the time of a request.
   * onPreRequest(...args) will be called before executing the endpoint.
   * onPostRequest(...args) will be called after executing the endpoint.
   * 
   * If onPreRequest **returns false**, the endpoint's execution will be ignored as well as the post-request middleware.
   * In order to keep the execution cycle going, onPreRequest must return true.
   * Although in almost all use cases returning true will sound logical, Identity verifications fit in the concept of returning false.
   *
   *        export class MyMiddleware implements MiddlewareTarget {
   *            onPreRequest(@RequestParam() request: Request, @ResponseParam() response: any) {
   *                console.log("onPreRequest() called");
   *                return true;
   *            }
   * 
   *            onPostRequest() {
   *                console.log("onPostRequest() called");
   *            }
   *        }
   *
   */
export interface MiddlewareTarget {
    onPreRequest(...args: Array<any>): boolean;
    onPostRequest(...args: Array<any>): void;
}

export interface NonComponentMiddlewareTarget {
    onPreRequest(request: any, response: any): boolean;
    onPostRequest(request: any, response: any): void;
}