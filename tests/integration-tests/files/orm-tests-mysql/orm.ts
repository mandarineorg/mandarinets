// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { MandarineCore } from "../../../../main-core/mandarineCore.ts";
import { Controller } from "../../../../mvc-framework/core/decorators/stereotypes/controller/controller.ts";
import { GET } from "../../../../mvc-framework/core/decorators/stereotypes/controller/routingDecorator.ts";
import { Column, GeneratedValue, Id, Table } from "../../../../orm-core/core/decorators/entityDecorators.ts";
import { Repository } from "../../../../orm-core/core/decorators/Repository.ts";
import { MandarineRepository } from "../../../../orm-core/repository/mandarineRepository.ts";
import { Types } from "../../../../orm-core/sql/types.ts";

@Table()
export class flights {

    @Id()
    @GeneratedValue({strategy: "SEQUENCE"})
    @Column()
    public id?: number;

    @Column()
    public flightId?: string;

    @Column()
    public captain?: string;

    @Column()
    public airline?: string;

    @Column()
    public fromFlight?: string;

    @Column({
        type: Types.FLOAT
    })
    public duration?: number;

    @Column()
    public toFlight?: string;
}

@Repository()
export abstract class FlightsRepository extends MandarineRepository<flights> {

    constructor() {
        super(flights);
    }
    
    // @ts-ignore
    public findByFlightId<T>(id: string): T { return; }
    public findByAirline(airline: string) {}
    public findByFlightIdOrCaptain(flightId: string, captain: string) {}
    public findByAirlineAndFromFlight(airline: string, from: string) {}
    public findByFromFlightAndToFlight(from: string, to: string) {}
    public findByFromFlightOrToFlightAndAirline(from: string, to: string, airline: string) {}
    public findByCaptainAndAirline(captain: string, airline: string) {}
    public findByFromFlight(from: string) {}
    public countByToFlight(to: string) {}
    public countByCaptain(captain: string) {}
    public deleteByCaptain(captain: string) {}
    public deleteByFlightIdOrToFlight(flightId: string, to: string) {}
    public findByDurationGreaterThan(duration: number) {}
    public findByDurationLessThan(duration: number) {}
    public findByDurationGreaterThanOrDurationLessThanAndToFlight(duration1: number, duration2: number, to: string) {}

}

@Controller()
export class MyController {

    constructor(private readonly flightsRepo: FlightsRepository) {}

    @GET("/create-fake-flights")
    public async handler() {
        const flights: Array<flights> = [{
            flightId: "AB1293",
            captain: "Andres Pirela",
            airline: "American Airlines",
            fromFlight: "FLL",
            duration: 2,
            toFlight: "RDU"
        },
        {
            flightId: "92H1238M",
            captain: "Nicole Lebroski",
            airline: "JetBlue",
            fromFlight: "RDU",
            duration: 1.5,
            toFlight: "FLL"
        },
        {
            flightId: "1293APS",
            captain: "Mark Alto",
            airline: "JetBlue",
            fromFlight: "AVL",
            duration: 1,
            toFlight: "RDU"
        },
        {
            flightId: "1238023S",
            captain: "Edward Naths",
            airline: "Allegiant",
            fromFlight: "FLL",
            duration: 9,
            toFlight: "CDG"
        }];

        for(let i = 0; i<flights.length; i++) {
            await this.flightsRepo.save(flights[i]);
        }
    }

    @GET('/get-flights')
    public async handler2() {
        const flightById = await this.flightsRepo.findByFlightId("AB1293");
        const flightByAirline = await this.flightsRepo.findByAirline("JetBlue");
        const flightByAirlineAndFrom = await this.flightsRepo.findByAirlineAndFromFlight("JetBlue", "RDU");
        const flightByFromAndTo = await this.flightsRepo.findByFromFlightAndToFlight("FLL", "RDU");
        const flightByCaptainAndAirlineFalse = await this.flightsRepo.findByCaptainAndAirline("Mark Alto", "American airlines");
        const flightByCaptainAndAirlineTrue = await this.flightsRepo.findByCaptainAndAirline("Mark Alto", "JetBlue");
        const flightByFrom = await this.flightsRepo.findByFromFlight("AVL");
        const findAll = await this.flightsRepo.findAll();
        const countAll = await this.flightsRepo.countAll();
        const flightByFlightIdOrCaptain = await this.flightsRepo.findByFlightIdOrCaptain("NONVALID", "Edward Naths");
        const flightByFlightIdOrCaptainFalse = await this.flightsRepo.findByFlightIdOrCaptain("NONVALID", "NONVALID");
        const flightByFromOrToAndAirline = await this.flightsRepo.findByFromFlightOrToFlightAndAirline("NONVALID", "RDU", "JetBlue");
        const flightByFromOrToAndAirlineFLL = await this.flightsRepo.findByFromFlightOrToFlightAndAirline("FLL", "NONVALID", "NONVALID");
        const flightByDurationGreaterThan = await this.flightsRepo.findByDurationGreaterThan(2);
        const flightByDurationLessThan = await this.flightsRepo.findByDurationLessThan(2);
        const flightbyDurationGreaterThanORDurationLessThanAndTo = await this.flightsRepo.findByDurationGreaterThanOrDurationLessThanAndToFlight(2, 1.5, "RDU");
        return {
            flightById,
            flightByAirline,
            flightByAirlineAndFrom,
            flightByFromAndTo,
            flightByCaptainAndAirlineFalse,
            flightByCaptainAndAirlineTrue,
            flightByFrom,
            flightByFlightIdOrCaptain,
            flightByFlightIdOrCaptainFalse,
            flightByFromOrToAndAirline,
            flightByFromOrToAndAirlineFLL,
            findAll,
            countAll,
            flightByDurationGreaterThan,
            flightByDurationLessThan,
            flightbyDurationGreaterThanORDurationLessThanAndTo
        }
    }

    @GET('/delete-all')
    public async deleteAll() {
        await this.flightsRepo.deleteAll();
    }
}
new MandarineCore().MVC().run({ port: 1257 });