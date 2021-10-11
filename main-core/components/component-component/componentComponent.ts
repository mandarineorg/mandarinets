// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import type { Mandarine } from "../../Mandarine.ns.ts";

/**
* This class is used in the DI Container for Mandarine to store components annotated as @Component
*/
export class ComponentComponent implements Mandarine.MandarineCore.ComponentCommonInterface {

    public name?: string;
    public classHandler: any;
    public classHandlerPrimitive: any;
    public type?: Mandarine.MandarineCore.ComponentTypes;
    public configuration?: any;
    private internals: { [prop: string]: any } = {};

    constructor(name: string, classHandler: any, type: Mandarine.MandarineCore.ComponentTypes, configuration?: any) {
        this.name = name;
        this.classHandler = classHandler;
        this.type = type;
        this.configuration = configuration;

        if(!this.classHandlerPrimitive) {
            this.classHandlerPrimitive = classHandler;
        }
    }

    public getName() {
        return this.name || "";
    }

    public getClassHandler() {
        return this.classHandler;
    }

    public getClassHandlerPrimitive() {
        return this.classHandlerPrimitive;
    }

    public setClassHandler(handler: any) {
        this.classHandler = handler;
    }

    public addInternal(key: string, value: any) {
        this.internals[key] = value;
    }

    public getInternal<T = any>(key: string): T {
        return this.internals[key];
    }

    public deleteInternal(key: string): void {
        delete this.internals[key];
    }

    public internalExists(key: string): boolean {
        return this.getInternal(key) !== undefined;
    }
}