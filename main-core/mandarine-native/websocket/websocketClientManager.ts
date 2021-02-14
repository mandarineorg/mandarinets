// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { ApplicationContext } from "../../application-context/mandarineApplicationContext.ts";
import type { ComponentComponent } from "../../components/component-component/componentComponent.ts";
import { Mandarine } from "../../Mandarine.ns.ts";
import { MandarineConstants } from "../../mandarineConstants.ts";
import { WebSocketClientUtil } from "../../utils/components/websocketClient.ts";
import { ClassType } from "../../utils/utilTypes.ts";

export class WebSocketClientItem {

    constructor(public currentWebsocketComponent: ComponentComponent) {
    }

    public close(code?: any, reason?: any) {
        if(this.currentWebsocketComponent.internalExists(MandarineConstants.COMPONENT_PROPERTY_WEBSOCKET)) {
            this.currentWebsocketComponent.getInternal<WebSocket>(MandarineConstants.COMPONENT_PROPERTY_WEBSOCKET).close(code, reason);
        }
    }

    public mount() {
        if(this.currentWebsocketComponent.internalExists(MandarineConstants.COMPONENT_PROPERTY_WEBSOCKET)) {
            throw new Error("In order to mount a new WebSocket instance, space for the WebSocket client needs to be freed. Please close the current client first.")
        } else {
            const { url, protocols } = this.currentWebsocketComponent.configuration;
            WebSocketClientUtil.mount(this.currentWebsocketComponent, url, protocols);
        }
    }
    
    public getWebSocketInstance(): WebSocket | undefined {
        return this.currentWebsocketComponent.getInternal<WebSocket>(MandarineConstants.COMPONENT_PROPERTY_WEBSOCKET);
    }

}

export class WebSocketClientManager {
    
    public getWebSocketServer(component: ClassType): WebSocketClientItem | undefined  {
        const internalComponent = ApplicationContext.getInstance().getComponentsRegistry().getComponentByHandlerType(component);
        
        if(internalComponent) {
            const componentInstance: ComponentComponent = internalComponent.componentInstance;

            if(internalComponent.componentType !== Mandarine.MandarineCore.ComponentTypes.WEBSOCKET) {
                throw new Error("Component was found but it is not valid as a WebSocket client item since it is not a WebSocket component");
            }

            return new WebSocketClientItem(componentInstance);
        }
    }

}