use crate::*;

use tokio_postgres::types::{Type, IsNull};
use std::result::{Result as StdResult};
use bytes::{BytesMut};
use std::error::Error;
use tokio_postgres::types::*;

use byteorder::{BigEndian, ReadBytesExt};
use super::types_utils::{Point};

#[derive(Serialize, Deserialize, Debug)]
pub struct Line {
    a: f64,
    b: f64,
    c: f64
}


impl Line {
    pub fn new(a: f64, b: f64, c: f64) -> Line {
        Line {
            a: a,
            b: b,
            c: c
        }
    }
}

impl tokio_postgres::types::ToSql for Line {
    fn to_sql(&self, _: &Type, w: &mut BytesMut) -> StdResult<IsNull, Box<dyn Error + Sync + Send>> {
        Ok(IsNull::No)
    }

    accepts!(LINE);
    tokio_postgres::types::to_sql_checked!();
}

impl<'a> tokio_postgres::types::FromSql<'a> for Line {
    fn from_sql(_: &Type, mut buf: &[u8]) -> StdResult<Self, Box<dyn Error + Sync + Send>> {
        let x1 = buf.read_f64::<BigEndian>()?;
        let y2 = buf.read_f64::<BigEndian>()?;
        let y3 = buf.read_f64::<BigEndian>()?;

       Ok(Line::new(x1, y2, y3))
    }

    tokio_postgres::types::accepts!(LINE);
}