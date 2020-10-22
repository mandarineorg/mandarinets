extern crate deno_core;
#[macro_use]
extern crate lazy_static;
#[macro_use]
extern crate serde_json;

mod commands;
mod util;
mod pg_utils;
mod plugin_types;
mod types;
mod pg_interfaces;

use tokio_postgres::{Config as PGConfig, NoTls};
use futures::{Future, FutureExt};
use deno_core::plugin_api::{Interface, Op, ZeroCopyBuf};
use deadpool_postgres::{Manager, ManagerConfig, Pool, RecyclingMethod};
use serde::{Deserialize, Serialize};
use std::{
    clone::Clone,
    pin::Pin,
    result::Result,
    sync::{
        Mutex,
    },
};
use tokio::runtime::{Builder as TokioRuntimeBuilder, Runtime as TokioRuntime};
use once_cell::sync::OnceCell;

/** Globals */
static POOL_INSTANCE: OnceCell<Pool> = OnceCell::new();

lazy_static! {
    static ref IS_CONNECTED: Mutex<Option<bool>> = Mutex::new(Some(false));
    static ref STATIC_TOKIO: TokioRuntime = TokioRuntimeBuilder::new().threaded_scheduler().enable_all().build().unwrap();
}
/** End Globals */

#[derive(Serialize)]
pub struct SyncResult<T>
where
    T: Serialize,
{
    data: Option<T>,
    error: Option<String>,
}

#[derive(Serialize)]
pub struct AsyncResult<T>
where
    T: Serialize,
{
    command_type: CommandType,
    data: Option<T>,
    error: Option<String>,
    command_id: String
}

#[derive(Serialize, Deserialize, Clone)]
pub enum CommandType {
    Connect,
    Query,
    Execute
}

#[derive(Serialize, Deserialize, Clone)]
pub struct CommandArgs {
    command_type: CommandType,
    client_id: Option<usize>,
    command_id: String
}

#[derive(Serialize, Deserialize, Clone)]
pub struct Command {
    args: CommandArgs,
    #[serde(skip)]
    data: Vec<ZeroCopyBuf>
}

impl Command {
    fn new(header: &[u8], data: Vec<ZeroCopyBuf>) -> Command {
        let comand_args_from_header: CommandArgs = serde_json::from_slice(header).unwrap();
        Command {
            args : comand_args_from_header,
            data : data
        }
    }
}

#[no_mangle]
pub fn deno_plugin_init(interface: &mut dyn Interface) {
    interface.register_op("mandarine_postgres_plugin", op_command);
}

fn op_command(_interface: &mut dyn Interface, zero_copy: &mut [ZeroCopyBuf]) -> Op {
    let (first, rest) = zero_copy.split_first().unwrap();
    let args: Command = Command::new(first, rest.to_vec());
    let args2: Command = args.clone();
    match args2.args.command_type {
        CommandType::Connect => util::sync_op(commands::connect, args2),
        CommandType::Query => util::async_op(commands::prepared_statement_query, args2),
        CommandType::Execute => util::async_op(commands::execute_query, args2)
    }
}