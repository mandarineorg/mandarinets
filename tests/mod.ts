// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

export * as DenoAsserts from "https://deno.land/std@0.71.0/testing/asserts.ts";
export { Orange, Test } from "https://deno.land/x/orange@v0.3.0/mod.ts";

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

export const INTEGRATION_TEST_FILES_TO_RUN_DIRECTORY = "./tests/integration-tests/files";