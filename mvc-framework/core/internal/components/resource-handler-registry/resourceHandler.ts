// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { Mandarine } from "../../../../../main-core/Mandarine.ns.ts";

/**
 * This class works as a container for resource handlers.
 * This class contains the paths where the resolver will be invoked.
 * This class contains the locations where the resolver should look up for resources.
 * This class contains the indexes of the paths.
 * This class contains the resolver to be used when intercepting.
 */
export class ResourceHandler implements Mandarine.MandarineCore.IResourceHandler {

    public resourceHandlerPath: Array<RegExp> | undefined = undefined;
    public resourceHandlerLocations: Array<string> | undefined = undefined;
    public resourceHandlerIndex: Array<string> | undefined = undefined;
    public resourceResolver: Mandarine.MandarineMVC.HTTPResolvers.ResourceResolver | undefined = undefined;
    public resourceCors: Mandarine.MandarineMVC.CorsMiddlewareOption | undefined = undefined; 
    
    public addResourceHandler(...resourceHandlerPath: Array<RegExp>): ResourceHandler {
        this.resourceHandlerPath = resourceHandlerPath;
        return this;
    }

    public addResourceHandlerLocation(...resourceHandlerLocations: Array<string>): ResourceHandler {
        this.resourceHandlerLocations = resourceHandlerLocations;
        return this;
    }

    public addResourceHandlerIndex(...resourceHandlerIndex: Array<string>): ResourceHandler {
        this.resourceHandlerIndex = resourceHandlerIndex;
        return this;
    }

    public addResourceResolver(resolver: Mandarine.MandarineMVC.HTTPResolvers.ResourceResolver): ResourceHandler {
        this.resourceResolver = resolver;
        return this;
    }

    public addResourceCors(cors: Mandarine.MandarineMVC.CorsMiddlewareOption): ResourceHandler {
        if(cors == undefined) return this;
        if(cors.optionsSuccessStatus == (null || undefined)) cors.optionsSuccessStatus = Mandarine.Defaults.MandarineDefaultCorsOptions.optionsSuccessStatus;
        
        this.resourceCors = cors;
        return this;
    }

}