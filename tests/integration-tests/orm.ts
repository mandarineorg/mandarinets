// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { CommonUtils } from "../../main-core/utils/commonUtils.ts";
import { DenoAsserts, INTEGRATION_TEST_FILES_TO_RUN_DIRECTORY, Orange, Test } from "../mod.ts";

const flights = [{
    id: 1,
    flightId: "AB1293",
    captain: "Andres Pirela",
    airline: "American Airlines",
    fromFlight: "FLL",
    duration: "2",
    toFlight: "RDU"
},
{
    id: 2,
    flightId: "92H1238M",
    captain: "Nicole Lebroski",
    airline: "JetBlue",
    fromFlight: "RDU",
    duration: "1.5",
    toFlight: "FLL"
},
{
    id: 3,
    flightId: "1293APS",
    captain: "Mark Alto",
    airline: "JetBlue",
    fromFlight: "AVL",
    duration: "1",
    toFlight: "RDU"
},
{
    id: 4,
    flightId: "1238023S",
    captain: "Edward Naths",
    airline: "Allegiant",
    fromFlight: "FLL",
    duration: "9",
    toFlight: "CDG"
}];

export class ORMTest {

    public MAX_COMPILATION_TIMEOUT_SECONDS = 50;

    constructor() {
        Orange.setOptions(this, {
            hooks: {
                beforeEach: () => CommonUtils.sleep(2)
            }
        })
    }

    public verifyFlights(getFlights: any) {
        DenoAsserts.assertEquals(getFlights["flightById"], [flights[0]]);
        DenoAsserts.assertEquals(getFlights["flightByAirline"], [
            flights[1], flights[2]
        ]);
        DenoAsserts.assertEquals(getFlights["flightByAirlineAndFrom"], [flights[1]]);
        DenoAsserts.assertEquals(getFlights["flightByFromAndTo"], [flights[0]]);
        DenoAsserts.assertEquals(getFlights["flightByCaptainAndAirlineFalse"], []);
        DenoAsserts.assertEquals(getFlights["flightByCaptainAndAirlineTrue"], [flights[2]]);
        DenoAsserts.assertEquals(getFlights["flightByFrom"], [flights[2]]);
        DenoAsserts.assertEquals(getFlights["findAll"], flights);
        DenoAsserts.assertEquals(getFlights["countAll"], flights.length);
        DenoAsserts.assertEquals(getFlights["flightByFlightIdOrCaptain"], [flights[3]]);
        DenoAsserts.assertEquals(getFlights["flightByFlightIdOrCaptainFalse"], []);
        DenoAsserts.assertEquals(getFlights["flightByFromOrToAndAirline"], [flights[2]]);
        DenoAsserts.assertEquals(getFlights["flightByFromOrToAndAirlineFLL"], [flights[0], flights[3]]);
        DenoAsserts.assertEquals(getFlights["flightByDurationGreaterThan"], [flights[3]]);
        DenoAsserts.assertEquals(getFlights["flightByDurationLessThan"], [flights[1], flights[2]]);
        DenoAsserts.assertEquals(getFlights["flightbyDurationGreaterThanORDurationLessThanAndTo"], [flights[2], flights[3]]);
    }

    @Test({
        name: "[POSTGRES] Test Endpoints from `files/orm-tests-pg/orm.ts`",
        description: "Test all endpoints in file, and verifies that a Mandarine's built-in ORM is working properly."
    })
    public async testPostgresORM() {
        let cmd = Deno.run({
            cmd: ["deno", "run", "-c", "tsconfig.json", "--allow-all", "--unstable", `${INTEGRATION_TEST_FILES_TO_RUN_DIRECTORY}/orm-tests-pg/orm.ts`],
            stdout: "inherit",
            stderr: "inherit",
            stdin: "inherit",
            env: {
                MANDARINE_JSON_FILE: "./tests/integration-tests/files/orm-tests-pg/mandarine.json",
                MANDARINE_PROPERTY_FILE: "./tests/integration-tests/files/orm-tests-pg/properties.json"
            }
        });

        CommonUtils.sleep(this.MAX_COMPILATION_TIMEOUT_SECONDS);

        (await (await fetch("http://localhost:1293/create-fake-flights")).text());
        CommonUtils.sleep(2.5);
        let getFlights = (await (await fetch("http://localhost:1293/get-flights")).json());
        let errorThrown = undefined;
        try {
            this.verifyFlights(getFlights);
        } catch(error) {
            errorThrown = error;
        }
        
        cmd.close();
        if(errorThrown != undefined) {
            throw errorThrown;
        }
    }

    @Test({
        name: "[MYSQL] Test Endpoints from `files/orm-tests-mysql/orm.ts`",
        description: "Test all endpoints in file, and verifies that a Mandarine's built-in ORM is working properly."
    })
    public async testMysqlORM() {
        CommonUtils.sleep(25);
        let cmd = Deno.run({
            cmd: ["deno", "run", "-c", "tsconfig.json", "--allow-all", "--unstable", `${INTEGRATION_TEST_FILES_TO_RUN_DIRECTORY}/orm-tests-mysql/orm.ts`],
            stdout: "inherit",
            stderr: "inherit",
            stdin: "inherit",
            env: {
                MANDARINE_JSON_FILE: "./tests/integration-tests/files/orm-tests-mysql/mandarine.json",
                MANDARINE_PROPERTY_FILE: "./tests/integration-tests/files/orm-tests-mysql/properties.json"
            }
        });

        CommonUtils.sleep(this.MAX_COMPILATION_TIMEOUT_SECONDS);

        (await (await fetch("http://localhost:1257/create-fake-flights")).text());
        CommonUtils.sleep(2.5);
        let getFlights = (await (await fetch("http://localhost:1257/get-flights")).json());
        // patch
        Object.keys(getFlights).forEach((item) => {
            if(Array.isArray(getFlights[item])) {
                getFlights[item] = getFlights[item].map((item: any) => ({...item, duration: item.duration.toString() }));
            }
        });
        console.log(getFlights);
        let errorThrown = undefined;
        try {
            this.verifyFlights(getFlights);
        } catch(error) {
            errorThrown = error;
        }
        
        cmd.close();
        if(errorThrown != undefined) {
            throw errorThrown;
        }
    }

}