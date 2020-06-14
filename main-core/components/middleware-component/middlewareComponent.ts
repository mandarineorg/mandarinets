import { MandarineException } from "../../exceptions/mandarineException.ts";
import { Mandarine } from "../../Mandarine.ns.ts";
import { MiddlewareTarget } from "./middlewareTarget.ts";

/**
* This class is used in the DI Container for Mandarine to store components annotated as @Middleware
*/
export class MiddlewareComponent implements Mandarine.MandarineCore.ComponentCommonInterface {

    name?: string;
    regexRoute?: RegExp;
    classHandler: any;

    constructor(name?: string, regexRoute?: RegExp, classHandler?: any) {
        this.name = name;
        this.regexRoute = regexRoute;
        this.classHandler = classHandler;
    }

    public verifyHandlerImplementation() {
        let middlewareTarget: MiddlewareTarget = <MiddlewareTarget> this.classHandler;
        let isImplementationValid = (middlewareTarget.onPostRequest && typeof middlewareTarget.onPostRequest === 'function') && (middlewareTarget.onPreRequest && typeof middlewareTarget.onPreRequest === 'function');
        
        if(isImplementationValid == undefined) throw new MandarineException(MandarineException.MIDDLEWARE_NON_VALID_IMPL);
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

    public getRegexRoute() {
        return this.regexRoute;
    }

}