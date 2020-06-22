import { Mandarine } from "../../../../../main-core/Mandarine.ns.ts";

/**
 * This class works as a container for resource handlers.
 * This class contains the paths where the resolver will be invoked.
 * This class contains the locations where the resolver should look up for resources.
 * This class contains the indexes of the paths.
 * This class contains the resolver to be used when intercepting.
 */
export class ResourceHandler implements Mandarine.MandarineCore.IResourceHandler {

    public resourceHandlerPath: Array<RegExp>;
    public resourceHandlerLocations: Array<string>;
    public resourceHandlerIndex: Array<string>;
    public resourceResolver: Mandarine.MandarineMVC.HTTPResolvers.ResourceResolver;
    public resourceCors: Mandarine.MandarineMVC.CorsMiddlewareOption;
    
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
        if(cors.origin == (null || undefined)) cors.origin = Mandarine.Defaults.MandarineDefaultCorsOptions.origin;
        if(cors.methods == (null || undefined)) cors.methods = Mandarine.Defaults.MandarineDefaultCorsOptions.methods;
        if(cors.optionsSuccessStatus == (null || undefined)) cors.optionsSuccessStatus = Mandarine.Defaults.MandarineDefaultCorsOptions.optionsSuccessStatus;
        
        this.resourceCors = cors;
        return this;
    }

}