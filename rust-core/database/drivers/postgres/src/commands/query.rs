use crate::*;
use std::fmt::*;
use tokio::task;


#[derive(Serialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct ConnectResult {
    success: bool
}

pub fn calculate(command: Command) -> util::AsyncJsonOp<i32> {
   
    let fut = async move {
        let rt = TokioRuntime::new().unwrap();

        let ias: i32 = rt.spawn(async move {
            println!("invoking");
            let pool = PG_POOL.lock().unwrap().take().unwrap();
            let client = pool.get().await.unwrap();
            let stmt = client.prepare("SELECT 1 + $1").await.unwrap();
            let int: i32 = 15;
            let rows = client.query(&stmt, &[&int]).await.unwrap();
            let value: i32 = rows[0].get(0);

            value
            
        }).await.unwrap();

        Ok(ias)
    };

    fut.boxed()
}