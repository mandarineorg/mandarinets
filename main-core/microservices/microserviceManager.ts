// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.
import { Mandarine } from "../Mandarine.ns.ts";
import { ClassType } from "../utils/utilTypes.ts";
import * as Microlemon from "./mod.ts";
import { microserviceWorkerBase64Bundle } from "./base64bundle.ts"
import { Log } from "../../logger/log.ts";
import { ComponentComponent } from "../components/component-component/componentComponent.ts";

export class MicroserviceManager {

    private logger: Log = Log.getLogger(MicroserviceManager);

    private microservices: Array<Mandarine.MandarineCore.MicroserviceItem> = new Array<Mandarine.MandarineCore.MicroserviceItem>();

    public async create(componentPrimitive: ClassType, configuration: Microlemon.ConnectionData): Promise<[boolean, Mandarine.MandarineCore.MicroserviceItem]> {
        const worker = new Worker(microserviceWorkerBase64Bundle, {
            type: "module",
            deno: {
                namespace: true,
            },
        });

        let [scopeResolve, scopeReject]: [any, any] = [undefined, undefined];

        const resolvable = new Promise((resolve, reject) => {
            scopeResolve = resolve;
            scopeReject = reject;
        });

        worker.onerror = (e: ErrorEvent) => {
            e.preventDefault();
        }

        let microserviceStatus: Mandarine.MandarineCore.MicroserviceStatus | undefined;
        worker.onmessage = (e: MessageEvent) => {

           let { data } = e;
            data = JSON.parse(data);

            if(data.message === "MANDARINE_MICROSERVICE_READY") {
                this.logger.info("Microservice has been successfully initialized");
                microserviceStatus = "Initialized";
            } else {
                this.logger.error("Microservice could not be initialized");
            }

            scopeResolve();
        };


        worker.postMessage({
            cmd: "INITIALIZE",
            configuration: configuration
        });

        await resolvable;

        const microserviceItem = {
            worker: worker,
            createdDate: new Date(),
            lastMountingDate: new Date(),
            status: microserviceStatus!,
            parentComponent: componentPrimitive,
            microserviceConfiguration: configuration
        };

        this.microservices.push(microserviceItem);

        return [microserviceStatus === "Initialized", microserviceItem];

    }

    public getByComponent(component: ComponentComponent): Mandarine.MandarineCore.MicroserviceItem | undefined {
        return this.microservices.find((item: Mandarine.MandarineCore.MicroserviceItem) => component.getClassHandler() instanceof item.parentComponent);
    }

}