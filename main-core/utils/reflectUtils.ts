import { Reflect } from "../reflectMetadata.ts";

export class ReflectUtils {
    
    public static getClassName(target: any): string {
        let className:string = target.constructor.name;
        if(className === "Function") return target.name;
        return className;
    }

    public static getParamNames(method: any): Array<string> {
        let STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
        let ARGUMENT_NAMES = /([^\s,]+)/g;

        var fnStr = method.toString().replace(STRIP_COMMENTS, '');
        var result = fnStr.slice(fnStr.indexOf('(')+1, fnStr.indexOf(')')).match(ARGUMENT_NAMES);

        if(result === null)
            result = [];
        return result;
    }

    public static getMethodsFromClass(objClass): Array<string> {
        try {
            return Object.getOwnPropertyNames(objClass.prototype).filter(methodName => methodName != "constructor");
        } catch(error) {
            return Object.getOwnPropertyNames(Object.getPrototypeOf(objClass)).filter(methodName => methodName != "constructor");
        }
    }

    public static checkClassInitialized(objClass): boolean {
        try {
            new objClass();
        } catch(error) {
            return true;
        }
        return false;
    }

    public static constructorHasParameters(objClass): boolean {
        return Reflect.getMetadata("design:paramtypes", objClass) != undefined;
    }
}