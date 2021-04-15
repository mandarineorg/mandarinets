// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.
import { Mandarine } from "../Mandarine.ns.ts";
import { ClassType } from "../utils/utilTypes.ts";
import * as Microlemon from "./mod.ts";
import { microserviceWorkerBase64Bundle } from "./base64bundle.ts"
import { Log } from "../../logger/log.ts";
import { ComponentComponent } from "../components/component-component/componentComponent.ts";
import { CommonUtils } from "../utils/commonUtils.ts";
import { ApplicationContext } from "../application-context/mandarineApplicationContext.ts";

export class MicroserviceManager implements Mandarine.MandarineCore.IMicroserviceManager {

    private logger: Log = Log.getLogger(MicroserviceManager);
    private microservices: Array<Mandarine.MandarineCore.MicroserviceItem> = new Array<Mandarine.MandarineCore.MicroserviceItem>();
    private automaticHealthIntervalId!: number;

    private async createMicroserviceWorker(configuration: Microlemon.ConnectionData): Promise<[Worker, Mandarine.MandarineCore.MicroserviceStatus | undefined]> {
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

        return [worker, microserviceStatus];
    }

    private async createFromExistent(existent: Mandarine.MandarineCore.MicroserviceItem) {
        const [worker, microserviceStatus] = await this.createMicroserviceWorker(existent.microserviceConfiguration);
        const microserviceItem: Mandarine.MandarineCore.MicroserviceItem = {
            ...existent,
            worker: worker,
            lastMountingDate: new Date(),
            status: microserviceStatus!,
            hash: CommonUtils.generateUUID()
        };
        return microserviceItem;
    }

    public async create(componentPrimitive: ClassType, configuration: Microlemon.ConnectionData): Promise<[boolean, Mandarine.MandarineCore.MicroserviceItem]> {
        const [worker, microserviceStatus] = await this.createMicroserviceWorker(configuration);

        const microserviceItem = {
            worker: worker,
            createdDate: new Date(),
            lastMountingDate: new Date(),
            status: microserviceStatus!,
            parentComponent: componentPrimitive,
            microserviceConfiguration: configuration,
            hash: CommonUtils.generateUUID()
        };

        this.microservices.push(microserviceItem);

        return [microserviceStatus === "Initialized", microserviceItem];

    }

    public getByComponent(component: ComponentComponent): Mandarine.MandarineCore.MicroserviceItem | undefined {
        return this.microservices.find((item: Mandarine.MandarineCore.MicroserviceItem) => component.getClassHandler() instanceof item.parentComponent);
    }

    public getByHash(hash: string): Mandarine.MandarineCore.MicroserviceItem | undefined {
        return this.microservices.find((item) => item.hash === hash);
    }

    public deleteByHash(hash: string): void {
        const microserviceItem = this.getByHash(hash);
        if(microserviceItem) {
            try {
                microserviceItem.worker.terminate();
            } catch {
                // It may be already terminated
            }
            this.microservices = this.microservices.filter((item) => item.hash !== hash);
        }
    }

    public async isHealthy(hash: string): Promise<boolean> {
        const microserviceItem = this.getByHash(hash);
        let [resolveScope,]: [any, any ]= [undefined, undefined];
        
        const promise = new Promise<boolean>((resolve) => {
            resolveScope = resolve;
        });

        if(microserviceItem) {
            const componentsRegistryContext = ApplicationContext.getInstance().getComponentsRegistry().getComponentByHandlerType(microserviceItem.parentComponent);
            if(componentsRegistryContext) {
                const component: ComponentComponent = componentsRegistryContext.componentInstance;
                const getPrevHealthChecks = () => component.getInternal("HEALTH_CHECKS_COUNTS");
                const prevHealthChecks = getPrevHealthChecks();

                microserviceItem.worker.postMessage({
                    cmd: "HEALTH"
                });

                let attemps = 0;
                const maxAttemps = 3;

                const healthInterval = setInterval(() => {
                    try {
                        const currentHealthChecks = getPrevHealthChecks();
                        if(currentHealthChecks > prevHealthChecks) {
                            resolveScope(true);
                        } else {
                            if(attemps === maxAttemps) {
                                clearInterval(healthInterval);
                                resolveScope(false);
                            }
                        }
                        attemps = attemps + 1;
                    } catch {
                        clearInterval(healthInterval);
                        resolveScope(false);
                    }
                }, 1000);
            }
        }

        const healthiness = await promise;
        if(!healthiness) {
            this.logger.error("A microservice has lost connection");
        }

        this.logger.debug("A healthcheck has been executed on a microservice");

        return healthiness;
    }

    public enableAutomaticHealthInterval() {
        const isAutomaticHealthCheckEnabled = Mandarine.Global.readConfigByDots("mandarine.microservices.automaticHealthCheck");
        if(isAutomaticHealthCheckEnabled === true && this.microservices.length >= 1) {
            const healthCheckInterval = Mandarine.Global.readConfigByDots("mandarine.microservices.automaticHealthCheckInterval") || Mandarine.Defaults.MandarineDefaultConfiguration.mandarine.microservices.automaticHealthCheckInterval;
            this.automaticHealthIntervalId = setInterval(() => {
                this.microservices.forEach(async (item) => {
                    const isHealthy = await this.isHealthy(item.hash);
                    if(!isHealthy) {
                        const newMicroservice = await this.createFromExistent(item);
                        this.deleteByHash(item.hash);
                        this.microservices.push(newMicroservice);

                        // ReConnect to proxy
                        const componentRegistry = ApplicationContext.getInstance().getComponentsRegistry();
                        const componentsRegistryContext = componentRegistry.getComponentByHandlerType(item.parentComponent);
                        if(componentsRegistryContext) {
                            componentRegistry.connectMicroserviceToProxy(componentsRegistryContext.componentInstance);
                            this.logger.info("A microservice has been reconnected");
                        }
                    }
                })
            }, healthCheckInterval);
        }
    }

    public disableAutomaticHealthInterval() {
        if(this.automaticHealthIntervalId) {
            clearInterval(this.automaticHealthIntervalId);
        }
    }

    public getMicroservices() {
        return this.microservices;
    }

}