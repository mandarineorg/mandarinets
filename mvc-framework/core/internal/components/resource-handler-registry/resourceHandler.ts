export class ResourceHandler {

    public resourceHandlerPath: RegExp;
    public resourceHandlerLocation: string;
    
    public addResourceHandler(resourceHandlerPath: RegExp): ResourceHandler {
        this.resourceHandlerPath = resourceHandlerPath;
        return this;
    }

    public addResourceHandlerLocation(resourceHandlerLocation: string): ResourceHandler {
        this.resourceHandlerLocation = resourceHandlerLocation;
        return this;
    }

}