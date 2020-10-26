// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { PgManager } from "../../../rust-core/database/drivers/postgres/ts-src/pgManager.ts";
import { DenoAsserts, Test } from "../../mod.ts";

const pgManager: PgManager = new PgManager({
    host: "127.0.0.1",
    username: "postgres",
    password: "Changeme1",
    dbname: "postgres",
    port: 5432
  });

export class PgDriverTests {
    
    @Test({
        name: "Create Table in Postgres",
        description: "Make sure driver is capable of getting right results when creating tables"
    })
    public async createTableTest() {
        let client = pgManager.getClient();
        let val = await client.batch_execute([`
        CREATE SEQUENCE public.users_id_seq
        INCREMENT 1
        START 1
        MINVALUE 1
        MAXVALUE 2147483647
        CACHE 1;
    
        ALTER SEQUENCE public.users_id_seq
        OWNER TO postgres;`,
         `
            CREATE TABLE public.users
            (
                id integer NOT NULL DEFAULT nextval('users_id_seq'::regclass),
                username character varying(255) COLLATE pg_catalog."default",
                money money,
                CONSTRAINT users_pkey PRIMARY KEY (id),
                CONSTRAINT users_id_key UNIQUE (id)
            )
            TABLESPACE pg_default;
            ALTER TABLE public.users
                OWNER to postgres;`
        ]);
        DenoAsserts.assertEquals(val.error, undefined);
    }

    @Test({
        name: "Insert in table",
        description: "Inserts data in the table previously created with parameters"
    })
    public async createUserTest() {
        let val = await pgManager.getClient().execute("INSERT INTO users VALUES ($1, $2, $3)", [12193, 'mandarine', '$20']);
        DenoAsserts.assertEquals(val.rows, []);
        DenoAsserts.assertEquals(val.rowCount, 1);
        DenoAsserts.assertEquals(val.success, true);
        DenoAsserts.assertEquals(val.error, undefined);

        let val2 = await pgManager.getClient().execute("INSERT INTO users VALUES ($1, $2, $3)", [12194, 'mandarine', '$20']);
    }

    @Test({
        name: "Query records",
        description: "Select from users table"
    })
    public async selectTest() {
        let val = await pgManager.getClient().query("SELECT FROM * users");
        DenoAsserts.assertEquals(val.rowCount, 2);
        DenoAsserts.assertNotEquals(val.rows, []);
        let row = val.rows[0];
        DenoAsserts.assertEquals(row[0].name, "id");
        DenoAsserts.assertEquals(row[1].name, "username");
        DenoAsserts.assertEquals(row[2].name, "money");

        DenoAsserts.assertEquals(row[0].value, 12193);
        DenoAsserts.assertEquals(row[1].value, "mandarine");
        DenoAsserts.assertEquals(row[2].value, 20);

        DenoAsserts.assertEquals(row[0].type, "int4");
        DenoAsserts.assertEquals(row[1].type, "varchar");
        DenoAsserts.assertEquals(row[2].type, "money");
    }

    @Test({
        name: "Delete records",
        description: "Delete all records from table"
    })
    public async deleterecordsTest() {
        let val = await pgManager.getClient().execute("DELETE FROM users where username = $1", ['mandarine']);
        DenoAsserts.assertEquals(val.rows, []);
        DenoAsserts.assertEquals(val.rowCount, 2);
        DenoAsserts.assertEquals(val.success, true);
        DenoAsserts.assertEquals(val.error, undefined);
    }
}