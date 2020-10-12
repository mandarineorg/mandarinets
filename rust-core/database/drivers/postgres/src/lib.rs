extern crate deno_core;
#[macro_use]
extern crate lazy_static;
#[macro_use]
extern crate serde_json;

use postgres::{Client, NoTls};
use deno_core::plugin_api::{Interface, Op, ZeroCopyBuf};
use serde::{Deserialize, Serialize};
use std::{
    collections::HashMap,
    sync::{
        atomic::{AtomicUsize},
        Mutex, MutexGuard,
    },
};

lazy_static! {
    static ref CLIENTS: Mutex<HashMap<usize, Client>> = Mutex::new(HashMap::new());
    static ref NEXT_CLIENT_ID: AtomicUsize = AtomicUsize::new(0);
}

#[derive(Serialize, Deserialize, Clone)]
pub enum CommandType {
    Connect,
    Close,
    Execute,
    BatchExecute,
    Query,
    TransactionCreate,
    TransactionCommit
}

#[derive(Clone)]
pub struct Command {
    args: CommandArgs,
    data: Vec<ZeroCopyBuf>,
}

#[derive(Deserialize, Clone)]
pub struct CommandArgs {
    command_type: CommandType,
    client_id: Option<usize>,
}

impl Command {
    fn new(args: CommandArgs, data: Vec<ZeroCopyBuf>) -> Command {
        Command { args, data }
    }

    fn get_client(&self) -> Client {
        get_client(self.args.client_id.unwrap())
    }
}

impl CommandArgs {
    fn new(data: &[u8]) -> CommandArgs {
        serde_json::from_slice(data).unwrap()
    }
}

#[no_mangle]
pub fn deno_plugin_init(interface: &mut dyn Interface) {
    interface.register_op("mandarine_postgres_plugin", op_command);
}

pub(crate) fn get_client(client_id: usize) -> Client {
    let map: MutexGuard<HashMap<usize, Client>> = CLIENTS.lock().unwrap();
    map.get(&client_id).unwrap().clone()
}

fn op_command(_interface: &mut dyn Interface, zero_copy: &mut [ZeroCopyBuf]) -> Op {
    let (first, rest) = zero_copy.split_first().unwrap();

    let result: Vec<u8> = "x".to_string().into_bytes();
    let result_box: Box<[u8]> = result.into_boxed_slice();
    Op::Sync(result_box)
}