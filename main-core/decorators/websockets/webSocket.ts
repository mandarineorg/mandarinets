// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { Mandarine } from "../../Mandarine.ns.ts";
import { MainCoreDecoratorProxy } from "../../proxys/mainCoreDecorator.ts";

/**
 * **Decorator**
 * Inject a value from the configuration file.
 *
 * `@Value('mandarine.server.host')`
 */
export const WebSocketClient = (url: string, protocols?: Array<string>): Function => {
    return (target: any) => {
        MainCoreDecoratorProxy.registerMandarinePoweredComponent(target, Mandarine.MandarineCore.ComponentTypes.WEBSOCKET, {
            url,
            protocols,
            type: "client"
        }, null);
    }
};

export const WebSocketServer = (port: number): Function => {
    return (target: any) => {
        MainCoreDecoratorProxy.registerMandarinePoweredComponent(target, Mandarine.MandarineCore.ComponentTypes.WEBSOCKET, {
            url: undefined,
            protocols: undefined,
            type: "server",
            port
        }, null);
    }
};


export const WSOnOpen = (): Function => {
    return (target: any, methodName: string) => {
        MainCoreDecoratorProxy.registerWebsocketProperty(target, "onOpen", methodName);
    }
}

export const WSOnClose = (): Function => {
    return (target: any, methodName: string) => {
        MainCoreDecoratorProxy.registerWebsocketProperty(target, "onClose", methodName);
    }
}

export const WSOnError = (): Function => {
    return (target: any, methodName: string) => {
        MainCoreDecoratorProxy.registerWebsocketProperty(target, "onError", methodName);
    }
}

export const WSOnMessage = (): Function => {
    return (target: any, methodName: string) => {
        MainCoreDecoratorProxy.registerWebsocketProperty(target, "onMessage", methodName);
    }
}

export const WSSend = (): Function => {
    return (target: any, methodName: string) => {
        MainCoreDecoratorProxy.registerWebsocketProperty(target, "send", methodName);
    }
}

export const WSClose = (): Function => {
    return (target: any, methodName: string) => {
        MainCoreDecoratorProxy.registerWebsocketProperty(target, "close", methodName);
    }
}