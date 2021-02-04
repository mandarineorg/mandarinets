// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { EventListener } from "../../../main-core/decorators/stereotypes/events/dom/eventListener.ts";
import { Service } from "../../../main-core/decorators/stereotypes/service/service.ts";
import { MandarineCore } from "../../../main-core/mandarineCore.ts";

@Service()
export class MyService {

    public getName() {
        return "ANDRES";
    }

}

@Service()
export class AnotherService {

    constructor(private readonly service: MyService) {}

    @EventListener('myEvent')
    public event() {
        console.log(this.service.getName());
        return this.service.getName();
    }

    @EventListener('asyncMyEvent')
    public async eventAsync() {
        console.log(this.service.getName() + " : async");
        return this.service.getName() + " : async";
    }
}

new MandarineCore().MVC().run();

dispatchEvent(new Event('myEvent'));

dispatchEvent(new Event('asyncMyEvent'));

setTimeout(() => Deno.exit(), 3000);
