// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import type { Mandarine } from "../../Mandarine.ns.ts";

/**
* This class is used in the DI Container for Mandarine to store components annotated as @Repository
*/
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
        return this.name || "";
    }

    public getClassHandler() {
        return this.classHandler;
    }

    public setClassHandler(handler: any) {
        this.classHandler = handler;
    }

}