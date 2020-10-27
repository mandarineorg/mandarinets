use crate::*;
use std::fmt::*;
use tokio_postgres::config::{SslMode as PGSslMode};
use std::time::Duration;


#[derive(Deserialize, Debug)]
pub enum SslMode {
    /// Do not use TLS.
    Disable,
    /// Attempt to connect with TLS but allow sessions without.
    Prefer,
    /// Require the use of TLS.
    Require,
}

#[derive(Deserialize, Debug)]
struct ConnectArgs {
    host: Option<String>,
    username: Option<String>,
    password: Option<String>,
    dbname: Option<String>,
    port: Option<u16>,

    #[serde(rename = "poolSize")]
    pool_size: Option<usize>,

    #[serde(rename = "sslMode")]
    ssl_mode: Option<SslMode>,

    #[serde(rename = "connectTimeout")]
    connect_timeout: Option<u64>,

    #[serde(rename = "keepalives")]
    keep_alives: Option<bool>,

    #[serde(rename = "keepalivesIdle")]
    keepalives_idle: Option<u64>,
}

#[derive(Serialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct ConnectResult {
    success: bool
}

pub fn connect(command: Command) -> util::JsonResult<ConnectResult> {
    let args: ConnectArgs = serde_json::from_slice(command.data[0].as_ref()).map_err(|e| e.to_string()).unwrap();

    let mut pg_config = PGConfig::new();
    pg_config.user(&args.username.unwrap());
    pg_config.password(&args.password.unwrap());
    pg_config.port(args.port.unwrap());
    pg_config.dbname(&args.dbname.unwrap());
    pg_config.host(&args.host.unwrap());

    let ssl_mode = &args.ssl_mode;
    let mut config_ssl: PGSslMode = PGSslMode::Prefer;
    if ssl_mode.is_some() {
        config_ssl = match ssl_mode.as_ref().unwrap() {
            SslMode::Disable => tokio_postgres::config::SslMode::Disable,
            SslMode::Prefer => tokio_postgres::config::SslMode::Prefer,
            SslMode::Require => tokio_postgres::config::SslMode::Require
        }
    }

    pg_config.ssl_mode(config_ssl);

    let connect_timeout = &args.connect_timeout;
    if connect_timeout.is_some() {
        pg_config.connect_timeout(Duration::from_secs(connect_timeout.unwrap()));
    }

    let keep_alives = &args.keep_alives;
    if keep_alives.is_some() {
        pg_config.keepalives(keep_alives.unwrap());
    }

    let keep_alives_idle = &args.keepalives_idle;
    if keep_alives_idle.is_some() {
        pg_config.keepalives_idle(Duration::from_secs(keep_alives_idle.unwrap()));
    }

    let manager = Manager::from_config(pg_config.clone(), NoTls, ManagerConfig {
        recycling_method: RecyclingMethod::Fast
    });

    let pool_size_option = &args.pool_size;
    let mut pool_size: usize = 25;

    if pool_size_option.is_some() {
        pool_size = pool_size_option.unwrap();
    }

    let pool_instance = Pool::new(manager, pool_size);

    let setting_pool = POOL_INSTANCE.set(pool_instance);
    if let Err(_) = setting_pool {
        Err("There was an error initializing the pool. Try again.".to_owned())
    } else {
        let mut is_connected_value = IS_CONNECTED.lock().unwrap();
        is_connected_value.replace(true);
        
        Ok(ConnectResult { success: true} )
    }
}