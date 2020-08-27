// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

/**
 * Provides information about an exception intercepted by a catch component.
 * 
 * `getException()` returns the instance of the error thrown
 * `getResponse()` returns the response object in the current request
 * `getRequest()` returns the request object of the current request
 */
export interface ExceptionContext<T = any> {
    getException(): T;
    getResponse(): any;
    getRequest(): any;
    getTimestamp(): string;
}

/**
 * Provides the necessary behavior to intercept an error thrown
 * 
 * `catch` will be responsible for handling the error.
 * A first parameter will be automatically injected by Mandarine containing the Context of the exception (ExceptionContext)
 */
export interface ExceptionFilter<T = Error> {
    catch(exceptionContext: ExceptionContext<T>, ...parameters: any): void;
}
