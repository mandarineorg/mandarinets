// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { AppBuilderUtil } from "../../main-core/app-builder/appBuilderUtil.ts";
import type { DecoratorReadResult } from "../../main-core/utils/decoratorFinder.ts";
import { Test, DenoAsserts, Orange, mockDecorator, MockCookies } from "../mod.ts";

export class AppBuilderTest {

    @Test({
        name: "Test App Builder",
        description: "Test automatic build & run outputs"
    })
    public testAppBuilder() {
        let decoratorsFile1: Array<DecoratorReadResult> = [
            {
                decorator: "Component",
                isDefault: false,
                isAbstract: false,
                className: "MyComponent"
            },
            {
                decorator: "Service",
                isDefault: false,
                isAbstract: false,
                className: "MyService"
            }
        ];


        let decoratorsFile2: Array<DecoratorReadResult> = [
            {
                decorator: "Component",
                isDefault: false,
                isAbstract: false,
                className: "MyComponent"
            }
        ];

        let decoratorsFile3: Array<DecoratorReadResult> = [
            {
                decorator: "Component",
                isDefault: false,
                isAbstract: false,
                className: "MyComponent"
            }
        ];

        decoratorsFile1 = AppBuilderUtil.attachFilePathDecoratorsResult("/users/mandarine/file1.ts", decoratorsFile1);
        decoratorsFile2 = AppBuilderUtil.attachFilePathDecoratorsResult("/users/mandarine/file2.ts", decoratorsFile2);
        decoratorsFile3 = AppBuilderUtil.attachFilePathDecoratorsResult("/users/mandarine/file2.ts", decoratorsFile3);


        DenoAsserts.assertEquals(decoratorsFile1, [
            {
              decorator: "Component",
              isDefault: false,
              isAbstract: false,
              className: "MyComponent",
              filePath: "/users/mandarine/file1.ts"
            },
            {
              decorator: "Service",
              isDefault: false,
              isAbstract: false,
              className: "MyService",
              filePath: "/users/mandarine/file1.ts"
            }
          ]);

          DenoAsserts.assertEquals(decoratorsFile2, [
            {
              decorator: "Component",
              isDefault: false,
              isAbstract: false,
              className: "MyComponent",
              filePath: "/users/mandarine/file2.ts"
            }]);

        let concatDecorators = decoratorsFile1.concat(decoratorsFile2).concat(decoratorsFile3);
        let repetitionStats: { [prop: string]: { current: number, maxRepetitions: number }} = {};
        const [repeatedDecoratorsArray, newRepetitionStats] = AppBuilderUtil.addressRepeatedClasNames(concatDecorators, repetitionStats);
        repetitionStats = newRepetitionStats;
        DenoAsserts.assertEquals(repetitionStats, { MyComponent: { current: 2, maxRepetitions: 3 } });
        DenoAsserts.assertEquals(repeatedDecoratorsArray, [
            {
              decorator: "Component",
              isDefault: false,
              isAbstract: false,
              className: "MyComponent",
              filePath: "/users/mandarine/file1.ts",
              asClassName: undefined
            },
            {
              decorator: "Service",
              isDefault: false,
              isAbstract: false,
              className: "MyService",
              filePath: "/users/mandarine/file1.ts"
            },
            {
              decorator: "Component",
              isDefault: false,
              isAbstract: false,
              className: "MyComponent",
              filePath: "/users/mandarine/file2.ts",
              asClassName: "MyComponent1"
            },
            {
              decorator: "Component",
              isDefault: false,
              isAbstract: false,
              className: "MyComponent",
              filePath: "/users/mandarine/file2.ts",
              asClassName: "MyComponent2"
            }
          ]);

        let dynamicEntryFile = `import { MandarineCore } from "https://deno.land/x/mandarinets@2.2.0/mod.ts";`;
        
        dynamicEntryFile = dynamicEntryFile.concat(AppBuilderUtil.createEntrypointData(repeatedDecoratorsArray));
        DenoAsserts.assertStringContains(dynamicEntryFile, `import { MandarineCore } from "https://deno.land/x/mandarinets@2.2.0/mod.ts";
import { MyComponent } from "file:///users/mandarine/file1.ts"

import { MyService } from "file:///users/mandarine/file1.ts"

import { MyComponent as MyComponent1 } from "file:///users/mandarine/file2.ts"

import { MyComponent as MyComponent2 } from "file:///users/mandarine/file2.ts"

const MANDARINE_AUTOGENERATED_COMPONENTS_LIST = [MyComponent, MyService, MyComponent1, MyComponent2];

new MandarineCore().MVC().run();`);

        
    }   
    

}