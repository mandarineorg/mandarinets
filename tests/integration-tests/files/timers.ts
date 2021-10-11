// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { ApplicationContext } from "../../../main-core/application-context/mandarineApplicationContext.ts";
import { Component } from "../../../main-core/decorators/stereotypes/component/component.ts";
import { Scheduled, Timer } from "../../../main-core/decorators/tasks/taskScheduler.ts";
import { TaskManager } from "../../../main-core/mandarine-native/tasks/taskManager.ts";
import { Mandarine } from "../../../main-core/Mandarine.ns.ts";
import { MandarineCore } from "../../../main-core/mandarineCore.ts";

@Component()
export class MyService {
    public getName() {
        return "Andres";
    }
}

@Component()
export class MyComponent {

    constructor(public service: MyService) {}

    @Scheduled("* * * * *")
    public everyMinute() {
        console.log("CRON", this.service.getName());
    }

    @Timer(30000)
    public every30Seconds() {
        console.log("TIMER", this.service.getName());
    }

}

setTimeout(() => {
    ApplicationContext.getInstance().getDIFactory().getDependency<TaskManager>(TaskManager)?.getCronManager().stopTasks();
    ApplicationContext.getInstance().getDIFactory().getDependency<TaskManager>(TaskManager)?.getCronManager().clearTasks();
    Mandarine.MandarineCore.Internals.getTimersManager().clearAll();
    Deno.exit(0);
}, 90000);

new MandarineCore();