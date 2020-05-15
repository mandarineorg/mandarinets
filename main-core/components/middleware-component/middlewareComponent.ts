import { ComponentCommonInterface } from "../componentCommonInterface.ts";
import { MiddlewareTarget } from "./middlewareTarget.ts";
import { MandarineException } from "../../exceptions/mandarineException.ts";

export class MiddlewareComponent implements ComponentCommonInterface {

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
        
        if(isImplementationValid == undefined) throw new MandarineException(MandarineException.MIDDLEWARE_NON_VALID_IMPL, this.name);
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