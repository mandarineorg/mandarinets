// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { Mandarine } from "../../Mandarine.ns.ts";
import { ExceptionFilter } from "./exceptionFilter.ts";

/**
* This class is used in the DI Container for Mandarine to store components annotated as @Catch
*/
export class CatchComponent implements Mandarine.MandarineCore.ComponentCommonInterface {

    public name?: string;
    public classHandler: ExceptionFilter;
    public exceptionType: any;

    constructor(name: string, exceptionType: any, classHandler?: any) {
        this.name = name;
        this.classHandler = classHandler;
        this.exceptionType = exceptionType;
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