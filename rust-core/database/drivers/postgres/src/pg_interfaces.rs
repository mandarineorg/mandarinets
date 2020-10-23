use crate::*;

use serde_json::Value;

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct CommonStatementArgs {
    pub statement: String,
    pub parameters: Option<Vec<Value>>
}

#[derive(Serialize, Deserialize)]
pub struct Row {
    name: String,
    value: Value,
    #[serde(rename = "type")]
    ctype: String
}

impl Row {
    pub fn new(name: String, value: Value, ctype: String) -> Row {
        Row {
            name,
            value,
            ctype
        }
    }
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct QueryResult {
    pub statement: String,
    pub rows: Vec<Vec<Value>>,
    pub row_count: usize,
    pub success: bool
}

impl QueryResult {
    pub fn new(statement: String, rows: Vec<Vec<Value>>, row_count: usize, success: bool) -> QueryResult {
        QueryResult {
            statement,
            rows,
            row_count,
            success: success
        }
    }

    pub fn new_nonrows(statement: String, row_count: usize, success: bool) -> QueryResult {
        let rows: Vec<Vec<Value>> = Vec::new();
        QueryResult {
            statement,
            rows,
            row_count,
            success
        }
    }
}