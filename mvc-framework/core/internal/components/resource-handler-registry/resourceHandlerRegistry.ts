import { ResourceHandler } from "./resourceHandler.ts";

export class ResourceHandlerRegistry {

    private resourceHandlers: Array<ResourceHandler> = new Array<ResourceHandler>();

    public addResourceHandler(input: ResourceHandler) {
        if(!this.resourceHandlers.some(item => item.resourceHandlerPath == input.resourceHandlerPath)) {
            this.resourceHandlers.push(input);
        }
    }

    public getResourceHandlers(): Array<ResourceHandler> {
        return this.resourceHandlers;
    }

}