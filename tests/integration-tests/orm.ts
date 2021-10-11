// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { CommonUtils } from "../../main-core/utils/commonUtils.ts";
import { DenoAsserts, INTEGRATION_TEST_FILES_TO_RUN_DIRECTORY, Orange, Test } from "../mod.ts";

const flights = [{
    id: 1,
    flightId: "AB1293",
    captain: "Andres Pirela",
    airline: "American Airlines",
    from: "FLL",
    duration: "2",
    to: "RDU"
},
{
    id: 2,
    flightId: "92H1238M",
    captain: "Nicole Lebroski",
    airline: "JetBlue",
    from: "RDU",
    duration: "1.5",
    to: "FLL"
},
{
    id: 3,
    flightId: "1293APS",
    captain: "Mark Alto",
    airline: "JetBlue",
    from: "AVL",
    duration: "1",
    to: "RDU"
},
{
    id: 4,
    flightId: "1238023S",
    captain: "Edward Naths",
    airline: "Allegiant",
    from: "FLL",
    duration: "9",
    to: "CDG"
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

    @Test({
        name: "[POSTGRES] Test Endpoints from `files/orm-tests-pg/orm.ts`",
        description: "Test all endpoints in file, and verifies that a Mandarine's built-in ORM is working properly."
    })
    public async testORM() {
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
            DenoAsserts.assertEquals(getFlights["flightById"], [flights[0]]);
            DenoAsserts.assertEquals(getFlights["flightByAirline"], [
                flights[1], flights[2]
            ]);
            DenoAsserts.assertEquals(getFlights["flightByAirlineAndFrom"], [flights[1]]);
            DenoAsserts.assertEquals(getFlights["flightByFromAndTo"], [flights[0]]);
            DenoAsserts.assertEquals(getFlights["flightByCaptainAndAirlineFalse"], null);
            DenoAsserts.assertEquals(getFlights["flightByCaptainAndAirlineTrue"], [flights[2]]);
            DenoAsserts.assertEquals(getFlights["flightByFrom"], [flights[2]]);
            DenoAsserts.assertEquals(getFlights["findAll"], flights);
            DenoAsserts.assertEquals(getFlights["countAll"], flights.length);
            DenoAsserts.assertEquals(getFlights["flightByFlightIdOrCaptain"], [flights[3]]);
            DenoAsserts.assertEquals(getFlights["flightByFlightIdOrCaptainFalse"], null);
            DenoAsserts.assertEquals(getFlights["flightByFromOrToAndAirline"], [flights[2]]);
            DenoAsserts.assertEquals(getFlights["flightByFromOrToAndAirlineFLL"], [flights[0], flights[3]]);
            DenoAsserts.assertEquals(getFlights["flightByDurationGreaterThan"], [flights[3]]);
            DenoAsserts.assertEquals(getFlights["flightByDurationLessThan"], [flights[1], flights[2]]);
            DenoAsserts.assertEquals(getFlights["flightbyDurationGreaterThanORDurationLessThanAndTo"], [flights[2], flights[3]]);
        } catch(error) {
            errorThrown = error;
        }
        
        cmd.close();
        if(errorThrown != undefined) {
            throw errorThrown;
        }
    }

}