// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { serve, Server } from "https://deno.land/std@0.87.0/http/server.ts";
import {
  acceptWebSocket,
  WebSocket,
} from "https://deno.land/std@0.87.0/ws/mod.ts";
import { Log } from "../../logger/log.ts";

const logger = new Log("WebWorker");
let isInitialized: boolean = false;
let socketServer: Server | undefined = undefined;

async function handleWs(sock: WebSocket) {
    try {
      for await (const ev of sock) {
        if(ev instanceof Uint8Array) {
          self.postMessage(ev, [ev]);
        } else {
          self.postMessage(ev);
        }
      }
    } catch (err) {
      if (!sock.isClosed) {
        await sock.close(1000).catch(logger.error);
      }
      throw err;
    }
}

const initializeSocket = async (port: string, restart?: boolean) => {

  const serveServer = () => serve(`:${port}`);

  if(!isInitialized) {
    socketServer = serveServer();

    if(restart === undefined) {
      logger.info("WebSocket has been initialized and isolated in worker.");
    }

    isInitialized = true;
  } else if(isInitialized && restart === true) {

    if(socketServer) {
      socketServer.close();
    }

    socketServer = serveServer();
  }

  if(isInitialized && socketServer) {
    for await (const req of socketServer) {
      const { conn, r: bufReader, w: bufWriter, headers } = req;
      acceptWebSocket({ conn, bufReader, bufWriter, headers})
      .then(handleWs)
      .catch(async (err) => {
          logger.error(`Failed to accept websocket: ${err}`);
          await req.respond({ status: 400 });
      });
    }
  }
}

self.onmessage = async ({ data }) => {
    const cmdObject = data;
    switch (cmdObject.cmd) {
        case "INITIALIZE":
          initializeSocket(cmdObject.data.port.toString());
        break;
        case "RESTART":
          initializeSocket(cmdObject.data.port.toString(), true);
        break;
    }
}