use crate::*;
use std::convert::AsMut;

pub type JsonResult<T> = Result<T, String>;

pub fn sync_op<D, T>(d: D, command: Command) -> Op
where
    D: Fn(Command) -> JsonResult<T>,
    T: Serialize,
{
    let res = d(command);
    Op::Sync(match res {
        Ok(data) => sync_result(data),
        Err(error) => sync_error(error),
    })
}

pub fn sync_result<T>(data: T) -> plugin_types::Buf
where
    T: Serialize,
{
    let result = SyncResult {
        data: Some(data),
        error: None,
    };
    let json = json!(result);
    let data = serde_json::to_vec(&json).unwrap();
    plugin_types::Buf::from(data)
}

pub fn sync_error(error: String) -> plugin_types::Buf {
    let result = SyncResult::<usize> {
        data: None,
        error: Some(error),
    };
    let json = json!(result);
    let data = serde_json::to_vec(&json).unwrap();
    plugin_types::Buf::from(data)
}

pub type AsyncJsonOp<T> = Pin<Box<dyn Future<Output = JsonResult<T>>>>;

pub fn async_op<D, T>(d: D, command: Command) -> Op
where
    D: Fn(Command) -> AsyncJsonOp<T>,
    T: Serialize + 'static,
{   
    println!("Invoking func");
    let res = d(command.clone());
    let fut = res.then(move |res| {
        futures::future::ready(match res {
            Ok(data) => async_result(&command.args, data),
            Err(error) => async_error(&command.args, error),
        })
    });
    
    Op::Async(fut.boxed_local())
}

pub fn async_result<T>(args: &CommandArgs, data: T) -> plugin_types::Buf
where
    T: Serialize,
{
    let args = args.clone();
    let result = AsyncResult {
        command_type: args.command_type,
        data: Some(data),
        error: None,
        command_id: args.command_id
    };
    let json = json!(result);
    let data = serde_json::to_vec(&json).unwrap();
    plugin_types::Buf::from(data)
}

pub fn async_error(args: &CommandArgs, error: String) -> plugin_types::Buf {
    let args = args.clone();
    let result = AsyncResult::<usize> {
        command_type: args.command_type,
        data: None,
        error: Some(error),
        command_id: args.command_id
    };
    let json = json!(result);
    let data = serde_json::to_vec(&json).unwrap();
    plugin_types::Buf::from(data)
}

pub fn clone_into_array<A, T>(slice: &[T]) -> A
where
    A: Default + AsMut<[T]>,
    T: Clone,
{
    let mut a = A::default();
    <A as AsMut<[T]>>::as_mut(&mut a).clone_from_slice(slice);
    a
}