import { Mandarine } from "../../Mandarine.ns.ts";

/**
* This class is used in the DI Container for Mandarine to store components annotated as @Configuration
*/
export class ConfigurationComponent implements Mandarine.MandarineCore.ComponentCommonInterface {
    name?: string;
    classHandler: any;

    constructor(name?: string, classHandler?: any) {
        this.name = name;
        this.classHandler= classHandler;
    }

    public getName() {
        return this.name;
    }

    public getClassHandler() {
        return this.classHandler;
    }

    public setClassHandler(handler: any) {
        this.classHandler = handler;
    }

}