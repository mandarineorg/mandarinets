// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { v4 } from "https://deno.land/std/uuid/mod.ts";
import { CommandTypes } from "./commandTypes.ts";
import { DenoCore } from "./common.ts";
import { PgManager } from "./pgManager.ts";
import { IQueryResult } from "./queryResult.ts";
import { AsyncResult, opCommandBuilder, SyncResult } from "./utils.ts";

export type QueryMapper<T = any> =(data: AsyncResult<IQueryResult>) => T;

export const encoder: TextEncoder = new TextEncoder();
export const decoder: TextDecoder = new TextDecoder();
export const pendingCommands: Map<String, { resolve: (data: unknown) => void; reject: (reason: any) => void }> = new Map();

export const initAsyncHandler = () => {
    DenoCore.setAsyncHandler(PgManager.opId, (msg: Uint8Array) => {
        const resOp = JSON.parse(decoder.decode(msg));
        const command = pendingCommands.get(resOp.command_id);

        if (command) {
          command.resolve((() => {
              pendingCommands.delete(resOp.command_id);
              return resOp;
          })());
        }
    });
}

export const DispatchSync = <T = any>(commandType: CommandTypes, ...data: ArrayBufferView[]): SyncResult<T> => {
    let dispatch = DenoCore.dispatch(PgManager.opId, encoder.encode(opCommandBuilder(CommandTypes.Connect)), ...data);
    return JSON.parse(decoder.decode(dispatch));
}

export const DispatchAsync = <T = any>(commandType: CommandTypes, ...data: ArrayBufferView[]): Promise<AsyncResult<T>> => {
    return new Promise((resolve: any, reject: any) => {
        const command_id = v4.generate();
        pendingCommands.set(command_id, { resolve, reject });

        DenoCore.dispatch(PgManager.opId, encoder.encode(opCommandBuilder(commandType, command_id)), ...data);
    });
}