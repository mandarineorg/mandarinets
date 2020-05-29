import { Service } from "../main-core/decorators/stereotypes/service/service.ts";
import { ApplicationContext } from "../main-core/application-context/mandarineApplicationContext.ts";
import { MandarineCore } from "../mod.ts";

@Service()
export class MyService {

    public pi() {
        return 3.14;
    }

}

class JSNativeClass {

    public getPiFromDIContainer() {
        return ApplicationContext.getInstance().getDIFactory().getDependency(MyService).pi();
    }

}

new MandarineCore();

let pi = new JSNativeClass().getPiFromDIContainer();
console.log(pi);