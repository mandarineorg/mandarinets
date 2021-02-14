// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import type { ComponentComponent } from "../../components/component-component/componentComponent.ts";
import { MandarineConstants } from "../../mandarineConstants.ts";
import { WebSocketBase64Const } from "../../websocket/base64bundle.ts";

export class WebSocketServerUtil {
    
    public static mount(component: ComponentComponent, port: number) {
        component.addInternal(MandarineConstants.COMPONENT_PROPERTY_WEBSOCKET, new Worker(WebSocketBase64Const, {
            type: "module",
            deno: {
                namespace: true,
              },
        }));

        component.getInternal<Worker>(MandarineConstants.COMPONENT_PROPERTY_WEBSOCKET).postMessage({
            cmd: "INITIALIZE",
            data: {
                port: port
            }
        });
    }

    public static unmount(component: ComponentComponent): void {
        component.getInternal<Worker>(MandarineConstants.COMPONENT_PROPERTY_WEBSOCKET).terminate();
        component.deleteInternal(MandarineConstants.COMPONENT_PROPERTY_WEBSOCKET);
    }

}