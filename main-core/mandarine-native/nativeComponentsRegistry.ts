import { ResourceHandlerRegistry } from "../../mvc-framework/core/internal/components/resource-handler-registry/resourceHandlerRegistry.ts";
import { MandarineException } from "../exceptions/mandarineException.ts";
import { Mandarine } from "../Mandarine.ns.ts";
import { WebMVCConfigurer } from "./mvc/webMvcConfigurer.ts";
import { MandarineSessionContainer } from "./sessions/mandarineSessionContainer.ts";
import { ReflectUtils } from "../utils/reflectUtils.ts";

export class NativeComponentsRegistry {

    public static instance: NativeComponentsRegistry;

    private nativeComponentsProperties: Map<Mandarine.MandarineCore.NativeComponents, Mandarine.MandarineCore.NativeComponentsProperties> = new Map<Mandarine.MandarineCore.NativeComponents, Mandarine.MandarineCore.NativeComponentsProperties>();

    private nativeComponents: Map<Mandarine.MandarineCore.NativeComponents, any> = new Map<Mandarine.MandarineCore.NativeComponents, any>();

    constructor() {
        this.loadNativeComponentsProperties();
        this.loadNativeComponents();
    }

    private loadNativeComponentsProperties() {
        // WebMVCConfigurer
        this.nativeComponentsProperties.set(Mandarine.MandarineCore.NativeComponents.WebMVCConfigurer, {
            key: Mandarine.MandarineCore.NativeComponents.WebMVCConfigurer,
            type: WebMVCConfigurer,
            children: [
                {
                    methodName: "getSessionContainer",
                    type: MandarineSessionContainer,
                    onOverride: (output: MandarineSessionContainer) => {
                        Mandarine.Global.changeSessionContainer(output);
                    }
                },
                {
                    methodName: "addResourceHandlers",
                    type: ResourceHandlerRegistry
                }
            ]
        });
    }

    private loadNativeComponents() {
        this.nativeComponents.set(Mandarine.MandarineCore.NativeComponents.WebMVCConfigurer, new WebMVCConfigurer());
    }

    public override(nativeComponentType: Mandarine.MandarineCore.NativeComponents, nativeComponent: any): void {
        const nativeComponentProps = this.nativeComponentsProperties.get(nativeComponentType);
        if(!nativeComponentProps) throw new MandarineException(MandarineException.INVALID_OVERRIDEN);
        const methodsPresentInOverriding: Array<string> = ReflectUtils.getMethodsFromClass(nativeComponent);

        if(!(nativeComponent instanceof nativeComponentProps.type)) throw new MandarineException(MandarineException.INVALID_OVERRIDEN);

        nativeComponentProps.children.forEach((child) => {
            if(methodsPresentInOverriding.includes(child.methodName)) {
                const methodCall = nativeComponent[child.methodName]();
                if(!(methodCall instanceof child.type)) throw new MandarineException(MandarineException.INVALID_OVERRIDEN_ON_METHOD.replace("%s", child.methodName));
            }
        });

        this.nativeComponents.set(nativeComponentType, nativeComponent);

    }

    public get(nativeComponentType: Mandarine.MandarineCore.NativeComponents) {
        return this.nativeComponents.get(nativeComponentType);
    }

    public static getInstance() {
        if(!NativeComponentsRegistry.instance) NativeComponentsRegistry.instance = new NativeComponentsRegistry();
        return NativeComponentsRegistry.instance;
    }
    
}