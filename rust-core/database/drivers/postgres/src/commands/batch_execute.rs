use crate::*;
use pg_interfaces::{QueryResult, CommonStatementArgs};

pub fn batch_execute(command: Command) -> util::AsyncJsonOp<QueryResult> {
    let args: CommonStatementArgs = serde_json::from_slice(command.data[0].as_ref()).map_err(|e| e.to_string()).unwrap();

    let fut = async move {
        let pool = POOL_INSTANCE.get().unwrap();
        let ias = (STATIC_TOKIO).spawn(async move {
            let client = pool.get().await;
            
            if let Err(e) = client {
                Err(e.to_string())
            } else {
                let unwrapped_pool = client.unwrap();
                let batch = unwrapped_pool.batch_execute(&args.statement).await;

                if let Err(e) = batch {
                    Err(e.to_string())
                } else {
                    Ok(QueryResult::new_nonrows(args.statement, 0 as usize, true))
                }
            }
        }).await.unwrap();

        ias
    };

    fut.boxed()
}
