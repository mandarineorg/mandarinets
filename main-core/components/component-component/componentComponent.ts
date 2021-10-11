// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import type { Mandarine } from "../../Mandarine.ns.ts";

/**
* This class is used in the DI Container for Mandarine to store components annotated as @Component
*/
export class ComponentComponent implements Mandarine.MandarineCore.ComponentCommonInterface {

    public name?: string;
    public classHandler: any;
    public type?: Mandarine.MandarineCore.ComponentTypes;
    public configuration?: any;

    constructor(name?: string, classHandler?: any, type?: Mandarine.MandarineCore.ComponentTypes, configuration?: any) {
        this.name = name;
        this.classHandler = classHandler;
        this.type = type;
        this.configuration = configuration;
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