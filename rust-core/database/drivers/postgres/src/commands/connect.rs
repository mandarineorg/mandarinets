use crate::*;
use std::fmt::*;

#[derive(Deserialize, Debug)]
struct ConnectArgs {
    host: Option<String>,
    username: Option<String>,
    password: Option<String>,
    dbname: Option<String>,
    port: Option<u16>
}

#[derive(Serialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct ConnectResult {
    success: bool
}

pub fn connect(command: Command) -> util::JsonResult<ConnectResult> {
    let args: ConnectArgs = serde_json::from_slice(command.data[0].as_ref()).map_err(|e| e.to_string()).unwrap();

    let mut value = PG_CONFIG.lock().unwrap();
    let mut pg_config = tokio_postgres::Config::new();
    pg_config.user(&args.username.unwrap());
    pg_config.password(&args.password.unwrap());
    pg_config.port(args.port.unwrap());
    pg_config.dbname(&args.dbname.unwrap());
    pg_config.host(&args.host.unwrap());
    let pg_config_clone = pg_config.clone();
    *value = pg_config;

    let mut pg_manager_value = PG_MANAGER.lock().unwrap();
    pg_manager_value.replace(Manager::from_config(pg_config_clone, NoTls, ManagerConfig {
        recycling_method: RecyclingMethod::Fast
    }));


    let pg_manager = (*pg_manager_value).take().unwrap();

    let pool_instance = Pool::new(pg_manager, 25);

    let mut pg_pool_value = PG_POOL.lock().unwrap();
    pg_pool_value.replace(pool_instance);

    let mut is_connected_value = IS_CONNECTED.lock().unwrap();
    is_connected_value.replace(true);
    
    Ok(ConnectResult { success: true} )
}