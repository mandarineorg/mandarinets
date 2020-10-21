use crate::*;

use tokio_postgres::types::{Type, IsNull};
use std::result::{Result as StdResult};
use bytes::{BytesMut};
use std::error::Error;
use tokio_postgres::types::*;
use std::net::{Ipv4Addr, Ipv6Addr};
use ipnetwork::{IpNetwork, Ipv4Network, Ipv6Network};

#[derive(Debug)]
pub struct Cidr {
    ip: Option<IpNetwork>
}


impl Cidr {
    pub fn new(ip: Option<IpNetwork>) -> Cidr {
        Cidr {
            ip: ip
        }
    }

    pub fn ip(&self) -> Option<IpNetwork> {
        self.ip
    }
}

macro_rules! err {
    () => {
        Err("invalid network address format".into())
    };
    ($msg:expr) => {
        Err(format!("invalid network address format. {}", $msg).into())
    };
}

macro_rules! assert_or_error {
    ($cond:expr) => {
        if !$cond {
            return err!();
        }
    };

    ($cond:expr, $msg:expr) => {
        if !$cond {
            return err!($msg);
        }
    };
}

impl tokio_postgres::types::ToSql for Cidr {
    fn to_sql(&self, _: &Type, w: &mut BytesMut) -> StdResult<IsNull, Box<dyn Error + Sync + Send>> {
        //w.put_i64(self.value);
        Ok(IsNull::No)
    }

    accepts!(CIDR);
    tokio_postgres::types::to_sql_checked!();
}

impl<'a> tokio_postgres::types::FromSql<'a> for Cidr {
    fn from_sql(ty: &Type, mut buf: &[u8]) -> StdResult<Self, Box<dyn Error + Sync + Send>> {
        let mut current_ip: Option<IpNetwork> = None;
        let buf_len = buf.len();
        assert_or_error!(4 <= buf_len, "input (cidr) is too short.");

        let prefix = buf[1];

        if buf_len == 8 {
            let b = &buf[4..];
            let addr = Ipv4Addr::new(b[0], b[1], b[2], b[3]);
            let inet = Ipv4Network::new(addr, prefix)?;

            current_ip.replace(IpNetwork::V4(inet));
            
        } else if buf_len == 20 {
            let b = &buf[4..];
            let addr = Ipv6Addr::from([
                b[0], b[1], b[2], b[3], b[4], b[5], b[6], b[7], b[8], b[9], b[10], b[11],
                b[12], b[13], b[14], b[15],
            ]);
            let inet = Ipv6Network::new(addr, prefix)?;

            current_ip.replace(IpNetwork::V6(inet));
        } else {
            assert_or_error!(false, "invalid network address format")
        }
        return Err("invalid buffer size".into());
        
        //Ok(Cidr::new(current_ip))

    }

    tokio_postgres::types::accepts!(CIDR);
}