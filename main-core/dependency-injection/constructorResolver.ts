import { Reflect } from "../reflectMetadata.ts";

export type Constructor<T = any> = new (...args: any[]) => T;

export const DIFactory = <T>(target: Constructor<T>): T => {
    const providers = Reflect.getMetadata('design:paramtypes', target); // [OtherService]
    const args = providers.map((provider: Constructor) => new provider());
    return new target(...args);
  };