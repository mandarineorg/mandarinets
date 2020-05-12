export class ComponentFactoryError extends Error {

    public static EXISTENT_COMPONENT: string = "The component you are trying to create has been already created. Component name should be unique";
    public static EXISTENT_DEPENDENCY: string = "The dependency you are trying to create cannot be created because the name is not available. Dependencies should have different names among components.";
  
    constructor(public message: string, component: string) {
      super(`${message} ~ ${component}`);
      this.name = "ComponentFactoryError";
      this.stack = (new Error()).stack;
    }
  
}
