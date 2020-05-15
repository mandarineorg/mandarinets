import { Mandarine } from "../../Mandarine.ns.ts";

export class ComponentComponent implements Mandarine.MandarineCore.ComponentCommonInterface {

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