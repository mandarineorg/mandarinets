// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { ApplicationContext } from "../../../main-core/application-context/mandarineApplicationContext.ts";
import { Component } from "../../../main-core/decorators/stereotypes/component/component.ts";
import { WebSocketServer, WSOnMessage } from "../../../main-core/decorators/websockets/webSocket.ts";
import { WebSocketServerManager } from "../../../main-core/mandarine-native/websocket/websocketServerManager.ts";
import { MandarineCore } from "../../../main-core/mandarineCore.ts";
import { CommonUtils } from "../../../main-core/utils/commonUtils.ts";

@Component()
export class MyComponent {

    public salute(name: string) {
        return `Hello ${name} from stdout`;
    }

}

@WebSocketServer(8585)
export class MyWebSocketServer {

    constructor(public service: MyComponent) {}

    @WSOnMessage()
    public handleIncomingMessage(data: any) {
        const username = data.data;
        console.log(this.service.salute(username));
    }

}

new MandarineCore();