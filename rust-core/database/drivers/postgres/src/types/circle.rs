use crate::*;

use tokio_postgres::types::{Type, IsNull};
use std::result::{Result as StdResult};
use bytes::{BytesMut};
use std::error::Error;
use tokio_postgres::types::*;

use byteorder::{BigEndian, ReadBytesExt};

#[derive(Serialize, Deserialize, Debug)]
pub struct Center {
    x: f64,
    y: f64
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Circle {
    center: Center,
    radius: f64
}


impl Circle {
    pub fn new(x: f64, y: f64, radius: f64) -> Circle {
        Circle {
            center: Center {
                x: x,
                y: y
            },
            radius: radius
        }
    }

}

impl tokio_postgres::types::ToSql for Circle {
    fn to_sql(&self, _: &Type, w: &mut BytesMut) -> StdResult<IsNull, Box<dyn Error + Sync + Send>> {
        Ok(IsNull::No)
    }

    accepts!(CIRCLE);
    tokio_postgres::types::to_sql_checked!();
}

impl<'a> tokio_postgres::types::FromSql<'a> for Circle {
    fn from_sql(_: &Type, mut buf: &[u8]) -> StdResult<Self, Box<dyn Error + Sync + Send>> {

        let x = buf.read_f64::<BigEndian>()?;
        let y = buf.read_f64::<BigEndian>()?;
        let r = buf.read_f64::<BigEndian>()?;
        Ok(Circle::new(x, y, r))

    }

    tokio_postgres::types::accepts!(CIRCLE);
}