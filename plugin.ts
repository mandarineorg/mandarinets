import { v4 } from "https://deno.land/std/uuid/mod.ts";

const rid = Deno.openPlugin("./rust-core/database/drivers/postgres/target/release/libpostgres.dylib");
//@ts-ignore
const { mandarine_postgres_plugin } = Deno.core.ops();

let encode = new TextEncoder();
let decoder = new TextDecoder();
const pendingCommands: Map<
  String,
  { resolve: (data: unknown) => void; reject: (reason: any) => void }
> = new Map();

let nextCommandId = 0;
//@ts-ignore
Deno.core.setAsyncHandler(mandarine_postgres_plugin, (msg: Uint8Array) => {
    const { command_id, data, error } = JSON.parse(decoder.decode(msg));
    console.log(command_id);
    const command = pendingCommands.get(command_id);
    if (command) {
      if (error) command.reject(new Error(error));
      else command.resolve(data);
    }
});

//@ts-ignore
let x = Deno.core.dispatch(mandarine_postgres_plugin, 
    encode.encode(JSON.stringify({
    command_type: "Connect",
    client_id: 0,
    command_id: ""
})), encode.encode(JSON.stringify({
    host: "127.0.0.1",
    username: "postgres",
    password: "Changeme1",
    dbname: "mandarine",
    port: 5432
})));

function dispatchAsync(
    json: ArrayBufferView,
    ...data: ArrayBufferView[]
  ): Promise<unknown> {
    return new Promise((resolve, reject) => {
        let command_id = v4.generate();
        console.log(command_id);
      pendingCommands.set(command_id, { resolve, reject });

      //@ts-ignore
      Deno.core.dispatch(mandarine_postgres_plugin, 
        encode.encode(JSON.stringify({
            command_type: "Execute", 
            client_id: 1, 
            command_id: command_id
        })), 
        encode.encode(JSON.stringify({
            statement: `INSERT INTO public.users VALUES (4, 'asdasdasd')`,
            parameters: ["1000"]
        })));

    });
}

// @ts-ignore
let lol: Promise<number> = dispatchAsync();
// @ts-ignore
//let lol2: Promise<number> = dispatchAsync();
// @ts-ignore
//let lol3: Promise<number> = dispatchAsync();
console.log(await lol);
console.log("After process");