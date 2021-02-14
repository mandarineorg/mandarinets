// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { ApplicationContext } from "../../application-context/mandarineApplicationContext.ts";
import type { ComponentComponent } from "../../components/component-component/componentComponent.ts";
import { Mandarine } from "../../Mandarine.ns.ts";
import { MandarineConstants } from "../../mandarineConstants.ts";
import { WebSocketServerUtil } from "../../utils/components/websocketServer.ts";
import { ClassType } from "../../utils/utilTypes.ts";

export class WebSocketServerItem {

    constructor(public currentWebsocketComponent: ComponentComponent) {
    }

    public reStart() {
        if(this.currentWebsocketComponent.internalExists(MandarineConstants.COMPONENT_PROPERTY_WEBSOCKET)) {
            this.currentWebsocketComponent.getInternal<Worker>(MandarineConstants.COMPONENT_PROPERTY_WEBSOCKET).postMessage({
                cmd: "RESTART",
                data: {
                    port: this.currentWebsocketComponent.configuration.port
                }
            });
        } else {
            throw new Error("WebSocket cannot be re-started because its worker does not exist. Please mount the worker.");
        }
    }

    public shutdown() {
        if(this.currentWebsocketComponent.internalExists(MandarineConstants.COMPONENT_PROPERTY_WEBSOCKET)) {
            WebSocketServerUtil.unmount(this.currentWebsocketComponent);
        }
    }

    public mount() {
        if(this.currentWebsocketComponent.internalExists(MandarineConstants.COMPONENT_PROPERTY_WEBSOCKET)) {
            throw new Error("In order to mount a WebSocket server, space for worker needs to be freed. Please terminate the worker first.");
        } else {
            WebSocketServerUtil.mount(this.currentWebsocketComponent, this.currentWebsocketComponent.configuration.port);
        }
    }

    public getWorkerInstance(): Worker | undefined {
        return this.currentWebsocketComponent.getInternal<Worker>(MandarineConstants.COMPONENT_PROPERTY_WEBSOCKET);
    }

}

export class WebSocketServerManager {
    
    public getWebSocketServer(component: ClassType): WebSocketServerItem | undefined  {
        const internalComponent = ApplicationContext.getInstance().getComponentsRegistry().getComponentByHandlerType(component);
        
        if(internalComponent) {
            const componentInstance: ComponentComponent = internalComponent.componentInstance;

            if(internalComponent.componentType !== Mandarine.MandarineCore.ComponentTypes.WEBSOCKET) {
                throw new Error("Component was found but it is not valid as a WebSocket server item since it is not a WebSocket component");
            }

            return new WebSocketServerItem(componentInstance);
        }
    }

}