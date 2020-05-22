import { MandarineException } from "../../exceptions/mandarineException.ts";
import { Mandarine } from "../../Mandarine.ns.ts";

export class RepositoryComponent implements Mandarine.MandarineCore.ComponentCommonInterface {

    public name?: string;
    public classHandler: any;
    public extraData: any;

    constructor(name?: string, classHandler?: any, extraData?: any) {
        this.name = name;
        this.classHandler = classHandler;
        this.extraData = extraData;
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