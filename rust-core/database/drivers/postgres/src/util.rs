use crate::*;

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

pub fn sync_result<T>(data: T) -> types::Buf
where
    T: Serialize,
{
    let result = SyncResult {
        data: Some(data),
        error: None,
    };
    let json = json!(result);
    let data = serde_json::to_vec(&json).unwrap();
    types::Buf::from(data)
}

pub fn sync_error(error: String) -> types::Buf {
    let result = SyncResult::<usize> {
        data: None,
        error: Some(error),
    };
    let json = json!(result);
    let data = serde_json::to_vec(&json).unwrap();
    types::Buf::from(data)
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

pub fn async_result<T>(args: &CommandArgs, data: T) -> types::Buf
where
    T: Serialize,
{
    let args = args.clone();
    let result = AsyncResult {
        command_type: args.command_type,
        data: Some(data),
        error: None,
    };
    let json = json!(result);
    let data = serde_json::to_vec(&json).unwrap();
    types::Buf::from(data)
}

pub fn async_error(args: &CommandArgs, error: String) -> types::Buf {
    let args = args.clone();
    let result = AsyncResult::<usize> {
        command_type: args.command_type,
        data: None,
        error: Some(error),
    };
    let json = json!(result);
    let data = serde_json::to_vec(&json).unwrap();
    types::Buf::from(data)
}