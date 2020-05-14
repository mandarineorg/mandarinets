import { Reflect } from "../reflectMetadata.ts";
import { ReflectUtils } from "../utils/reflectUtils.ts";
import { ComponentRegistryContext } from "../components-registry/componentRegistryContext.ts";
import { ApplicationContext } from "../application-context/mandarineApplicationContext.ts";
import { ComponentTypes } from "../components-registry/componentTypes.ts";
import { ComponentsRegistry } from "../components-registry/componentRegistry.ts";

export type Constructor<T = any> = new (...args: any[]) => T;

// export const DIFactory = <T>(target: Constructor<T>): T => {
//   const providers = Reflect.getMetadata('design:paramtypes', target); // [OtherService]
//   const args = providers.map((provider: Constructor) => new provider());
//   return new target(...args);
// };

export const DIFactory = <T>(componentSource: ComponentRegistryContext, componentRegistry: ComponentsRegistry): T => {
  if(componentSource.componentType == ComponentTypes.MANUAL_COMPONENT) return;

  let target: Constructor<T> = componentSource.componentInstance.getClassHandler();

  const providers = Reflect.getMetadata('design:paramtypes', target);
  const args = providers.map((provider: Constructor) => {
    let component: ComponentRegistryContext = componentRegistry.getComponentByHandlerType(provider);
    if(component != (undefined || null)) {
      let classHandler: any = (component.componentType == ComponentTypes.MANUAL_COMPONENT) ? component.componentInstance : component.componentInstance.getClassHandler();

      return (component.componentType == ComponentTypes.MANUAL_COMPONENT || ReflectUtils.checkClassInitialized(classHandler)) ? classHandler : new classHandler();
    } else {
      return undefined;
    }
  });

  return new target(...args);
};