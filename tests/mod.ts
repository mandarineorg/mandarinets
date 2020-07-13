export { Orange, Test } from "https://deno.land/x/orange@v0.2.7/mod.ts";
export * as DenoAsserts from "https://deno.land/std@0.61.0/testing/asserts.ts"; 

// Mocking a decorator will give us "design:paramtypes", otherwise it will fail
export function mockDecorator() {
    return (target: any, propertyName?: string) => {}
}

export const INTEGRATION_TEST_FILES_TO_RUN_DIRECTORY = "./tests/integration-tests/files";