extern crate deno_core;
#[macro_use]
extern crate lazy_static;
#[macro_use]
extern crate serde_json;

use std::sync::Arc;
use std::cell::RefCell;
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
use tokio::sync::oneshot;
mod commands;
mod util;

lazy_static! {
    static ref PG_CONFIG: Mutex<PGConfig> = Mutex::new(PGConfig::new());
    static ref PG_POOL: Mutex<Option<Pool>> = Mutex::new(None);
    static ref PG_MANAGER: Mutex<Option<Manager<NoTls>>> = Mutex::new(None);
    static ref IS_CONNECTED: Mutex<Option<bool>> = Mutex::new(Some(false));
    static ref MUTEX_TOKIO: TokioRuntime = TokioRuntime::new().unwrap();
}

pub type Buf = Box<[u8]>;

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
}

#[derive(Serialize, Deserialize, Clone)]
pub enum CommandType {
    Connect,
    Calculate
}

#[derive(Serialize, Deserialize, Clone)]
pub struct CommandArgs {
    command_type: CommandType,
    client_id: Option<usize>,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct PoolConf<M, P> {
    manager: M,
    pool: P,
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
        CommandType::Calculate => util::async_op(commands::calculate, args2)
    }
}