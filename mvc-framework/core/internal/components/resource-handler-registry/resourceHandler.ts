import { Mandarine } from "../../../../../main-core/Mandarine.ns.ts";

export class ResourceHandler implements Mandarine.MandarineCore.IResourceHandler {

    public resourceHandlerPath: Array<RegExp>;
    public resourceHandlerLocations: Array<string>;
    public resourceHandlerIndex: Array<string>;
    public resourceResolver: Mandarine.MandarineMVC.HTTPResolvers.ResourceResolver;
    
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

}