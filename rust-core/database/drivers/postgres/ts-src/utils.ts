// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { CommandTypes } from "./commandTypes.ts";

export interface AsyncResult<T> {
    command_type: CommandTypes,
    data: T,
    error: string,
    command_id: string
}

export interface SyncResult<T> {
    data: T,
    error: string,
}

export const opCommandBuilder = (commandType: CommandTypes, command_id?: String) => {
    return JSON.stringify({
        command_type: commandType,
        command_id: command_id ?? "",
        client_id: 0
    })
}