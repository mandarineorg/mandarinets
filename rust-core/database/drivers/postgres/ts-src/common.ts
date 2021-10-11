// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

//@ts-ignore
export const DenoCore = Deno.core as {
    ops: () => { [key: string]: number };
    setAsyncHandler(rid: number, handler: Function): void;
    dispatch(
      rid: number,
      msg: any,
      ...buf: ArrayBufferView[]
    ): Uint8Array | undefined;
};