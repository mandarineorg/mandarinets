// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

export * as DenoAsserts from "https://deno.land/std@0.67.0/testing/asserts.ts";
export { Orange, Test } from "https://deno.land/x/orange@v0.2.8";

// Mocking a decorator will give us "design:paramtypes", otherwise it will fail
export function mockDecorator() {
    return (target: any, propertyName?: string) => {}
}

export class MockCookies {

    private cookies = {};

    public set(cookieName: string, cookieValue: string) {
        this.cookies[cookieName] = cookieValue;
    }

    public get(cookieName) {
        return this.cookies[cookieName];
    }

    public delete(cookieName) {
        delete this.cookies[cookieName];
    }

}

export const INTEGRATION_TEST_FILES_TO_RUN_DIRECTORY = "./tests/integration-tests/files";