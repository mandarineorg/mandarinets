// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

export class MandarineMVCContext {

    public static mvcContextInstance: MandarineMVCContext;

    public routeSignatures: Array<Array<string>> = new Array<Array<string>>();

    public static getInstance(): MandarineMVCContext {
        if(!MandarineMVCContext.mvcContextInstance) MandarineMVCContext.mvcContextInstance = new MandarineMVCContext();
        return MandarineMVCContext.mvcContextInstance;
    }

}