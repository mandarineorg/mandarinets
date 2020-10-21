const rid = Deno.openPlugin("./rust-core/database/drivers/postgres/target/release/libpostgres.dylib");
//@ts-ignore
const { mandarine_postgres_plugin } = Deno.core.ops();

let encode = new TextEncoder();
//@ts-ignore
Deno.core.setAsyncHandler(mandarine_postgres_plugin, (msg: Uint8Array) => {
    console.log("Gotten from dispatch", new TextDecoder().decode(msg));
    return msg;
});

//@ts-ignore
let x = Deno.core.dispatch(mandarine_postgres_plugin, 
    encode.encode(JSON.stringify({
    command_type: "Connect",
    client_id: 0
})), encode.encode(JSON.stringify({
    host: "127.0.0.1",
    username: "postgres",
    password: "Changeme1",
    dbname: "mandarine",
    port: 5432
})));

console.log("Before process");
// @ts-ignore
let lol: Promise<number> = Deno.core.dispatch(mandarine_postgres_plugin, 
    encode.encode(JSON.stringify({
        command_type: "PreparedStatementQuery", client_id: 1
    })), 
    encode.encode(JSON.stringify({
        statement: `select (date '2001-09-28' + integer '7'	) as result`,
        parameters: ["1000"]
    })));

console.log("After process");
