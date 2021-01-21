// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

export * as DenoAsserts from "https://deno.land/std@0.84.0/testing/asserts.ts";
export { Orange, Test } from "https://deno.land/x/orange@v0.4.0/mod.ts";

// Mocking a decorator will give us "design:paramtypes", otherwise it will fail
export function mockDecorator() {
    return (target: any, propertyName?: string) => {}
}

export class MockCookies {

    private cookies: any = {};

    public set(cookieName: string, cookieValue: string) {
        this.cookies[cookieName] = cookieValue;
    }

    public get(cookieName: any) {
        return this.cookies[cookieName];
    }

    public delete(cookieName: any) {
        delete this.cookies[cookieName];
    }

}

export interface ResolvableMethods<T> {
    resolve: (value?: T | PromiseLike<T> | undefined) => void;
    // deno-lint-ignore no-explicit-any
    reject: (reason?: any) => void;
  }
  
export type Resolvable<T> = Promise<T> & ResolvableMethods<T>;
  
export function createResolvable<T>(): Resolvable<T> {
    let methods: ResolvableMethods<T>;
    const promise = new Promise<T>((resolve: any, reject: any): void => {
      methods = { resolve, reject };
    });
    // TypeScript doesn't know that the Promise callback occurs synchronously
    // therefore use of not null assertion (`!`)
    return Object.assign(promise, methods!) as Resolvable<T>;
}

export const INTEGRATION_TEST_FILES_TO_RUN_DIRECTORY = "./tests/integration-tests/files";