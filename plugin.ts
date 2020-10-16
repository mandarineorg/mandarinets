const rid = Deno.openPlugin("./rust-core/database/drivers/postgres/target/release/libpostgres.dylib");
//@ts-ignore
const { mandarine_postgres_plugin } = Deno.core.ops();

let encode = new TextEncoder();
//@ts-ignore
Deno.core.setAsyncHandler(mandarine_postgres_plugin, (msg: Uint8Array) => {
    console.log("Gotten from dispatch", new TextDecoder().decode(msg));
    return msg;
});
console.log("Before process");
// @ts-ignore
let lol: Promise<number> = Deno.core.dispatch(mandarine_postgres_plugin, 
    encode.encode(JSON.stringify({
        command_type: "Calculate", client_id: 1
    })), 
    encode.encode(JSON.stringify({"x": "x"})));

console.log("After process");
