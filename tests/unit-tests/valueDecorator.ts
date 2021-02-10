// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { ApplicationContext } from "../../main-core/application-context/mandarineApplicationContext.ts";
import { Value } from "../../main-core/decorators/configuration-readers/value.ts";
import { Service } from "../../main-core/decorators/stereotypes/service/service.ts";
import { MandarineCore } from "../../main-core/mandarineCore.ts";
import { DenoAsserts, Test } from "../mod.ts";

@Service()
class MyClass {

    @Value('lol')
    public static lol: string;

    @Value('noStatic')
    public noStatic!: string;

    @Value('object')
    public anObject!: object;

}

new MandarineCore({
    config: {
        lol: "MANDARINE1234",
        noStatic: "HELLO WORLD",
        object: {
            hello: "xd"
        }
    }
});

export class SessionTest {

    @Test({
        name: "Test @Value decorator",
        description: "Should test that values are created"
    })
    public testValueDecorator() {
       const component = ApplicationContext.getInstance().getComponentsRegistry().getComponentByHandlerType(MyClass)?.componentInstance.getClassHandler();
       DenoAsserts.assertEquals(MyClass.lol, "MANDARINE1234");
       DenoAsserts.assertEquals(component.noStatic, "HELLO WORLD");
        DenoAsserts.assertEquals(component.anObject, {
            hello: "xd"
        });
    }
}