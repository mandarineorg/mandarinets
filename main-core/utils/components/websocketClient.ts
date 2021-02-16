// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { ApplicationContext } from "../../application-context/mandarineApplicationContext.ts";
import type { ComponentComponent } from "../../components/component-component/componentComponent.ts";
import { MandarineConstants } from "../../mandarineConstants.ts";

export class WebSocketClientUtil {

    public static mount(component: ComponentComponent, url: string, protocols?: Array<any>) {
        component.addInternal(MandarineConstants.COMPONENT_PROPERTY_WEBSOCKET, new WebSocket(url, protocols));
        ApplicationContext.getInstance().getComponentsRegistry().connectWebsocketClientProxy(component);
    }

    public static close(component: ComponentComponent, code: any, reason: any) {
        component.getInternal<WebSocket>(MandarineConstants.COMPONENT_PROPERTY_WEBSOCKET).close(code, reason);
        component.deleteInternal(MandarineConstants.COMPONENT_PROPERTY_WEBSOCKET);
    }

}