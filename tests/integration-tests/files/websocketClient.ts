// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { ApplicationContext } from "../../../main-core/application-context/mandarineApplicationContext.ts";
import { WebSocketClient, WSOnMessage, WSSend } from "../../../main-core/decorators/websockets/webSocket.ts";
import { MandarineCore } from "../../../main-core/mandarineCore.ts";
import { CommonUtils } from "../../../main-core/utils/commonUtils.ts";

@WebSocketClient("ws://localhost:8585")
export class WebSocketClientClass {

    @WSSend()
    public sendProxy(data: string) {}

}

CommonUtils.sleep(5);
new MandarineCore();
CommonUtils.sleep(5);

setTimeout(() => {
    ApplicationContext.getInstance().getComponentsRegistry().getComponentByHandlerType(WebSocketClientClass)?.componentInstance.getClassHandler().sendProxy("Maria");
}, 2000);


setTimeout(() => {
    ApplicationContext.getInstance().getComponentsRegistry().getComponentByHandlerType(WebSocketClientClass)?.componentInstance.getClassHandler().sendProxy("Andres");
}, 2000);


setTimeout(() => {
    ApplicationContext.getInstance().getComponentsRegistry().getComponentByHandlerType(WebSocketClientClass)?.componentInstance.getClassHandler().sendProxy("Snejana");
}, 2000);
