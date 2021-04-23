// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { Mandarine } from "../../Mandarine.ns.ts";

export class MicroserviceUserManager {

    private getMicroserviceManager() {
        return Mandarine.Global.getMicroserviceManager();
    }

    /**
     * Gets the list of all the microservices present in the application.
     */
    public getMicroservices() {
        this.getMicroserviceManager().getMicroservices();
    }

    /**
     * 
     * @param microservice to be checked
     * @returns True if microservice is healthy or false if it is not
     */
    public async checkHealth(microservice: Mandarine.MandarineCore.MicroserviceItem): Promise<boolean> {
        return await this.getMicroserviceManager().isHealthyByMicroservice(microservice);
    }


    /**
     * 
     * @param microservice to be deleted
     */
    public delete(microservice: Mandarine.MandarineCore.MicroserviceItem) {
        this.getMicroserviceManager().deleteByMicroservice(microservice);
    }

    /**
     * Enable automatic health check.
     * If enabled, Mandarine will check healthiness of microservices and remount them if they are unhealthy
     */
    public enableAutomaticHealthCheck() {
        this.getMicroserviceManager().enableAutomaticHealthInterval();
    }

    /**
     * Disables automatic health checks.
     * If disabled, Mandarine is not responsible for checking and remounting unhealthy microservices
     */
    public disableAutomaticHealthCheck() {
        this.getMicroserviceManager().disableAutomaticHealthInterval();
    }

    /**
     * 
     * Generates a new microservice and initializes it.
     * 
     * @param microservice to be remounted
     */
    public remountFromExistent(microservice: Mandarine.MandarineCore.MicroserviceItem) {
        this.getMicroserviceManager().remountFromExistent(microservice);
    }

}