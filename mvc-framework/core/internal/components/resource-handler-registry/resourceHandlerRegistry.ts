import { Mandarine } from "../../../../../main-core/Mandarine.ns.ts";
import { ResourceHandler } from "./resourceHandler.ts";

export class ResourceHandlerRegistry implements Mandarine.MandarineCore.IResourceHandlerRegistry {

    public overriden: boolean = false;
    private resourceHandlers: Array<ResourceHandler> = new Array<ResourceHandler>();

    public addResourceHandler(input: ResourceHandler): ResourceHandlerRegistry {
        if(!this.resourceHandlers.some(item => item.resourceHandlerPath == input.resourceHandlerPath)) {
            this.resourceHandlers.push(input);
        }
        return this;
    }

    public getResourceHandlers(): Array<ResourceHandler> {
        return this.resourceHandlers;
    }

    public getNew(): Mandarine.MandarineCore.IResourceHandlerRegistry {
        return new ResourceHandlerRegistry();
    }

}