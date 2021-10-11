// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { MandarineCore } from "../../../../main-core/mandarineCore.ts";
import { Controller } from "../../../../mvc-framework/core/decorators/stereotypes/controller/controller.ts";
import { GET } from "../../../../mvc-framework/core/decorators/stereotypes/controller/routingDecorator.ts";
import { Column, GeneratedValue, Id, Table } from "../../../../orm-core/core/decorators/entityDecorators.ts";
import { Repository } from "../../../../orm-core/core/decorators/Repository.ts";
import { MandarineRepository } from "../../../../orm-core/repository/mandarineRepository.ts";
import { Types } from "../../../../orm-core/sql/types.ts";

@Table({ schema: "public" })
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
    public from?: string;

    @Column({
        type: Types.DECIMAL
    })
    public duration?: number;

    @Column()
    public to?: string;
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
    public findByAirlineAndFrom(airline: string, from: string) {}
    public findByFromAndTo(from: string, to: string) {}
    public findByFromOrToAndAirline(from: string, to: string, airline: string) {}
    public findByCaptainAndAirline(captain: string, airline: string) {}
    public findByFrom(from: string) {}
    public countByTo(to: string) {}
    public countByCaptain(captain: string) {}
    public deleteByCaptain(captain: string) {}
    public deleteByFlightIdOrTo(flightId: string, to: string) {}
    public findByDurationGreaterThan(duration: number) {}
    public findByDurationLessThan(duration: number) {}
    public findByDurationGreaterThanOrDurationLessThanAndTo(duration1: number, duration2: number, to: string) {}

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
            from: "FLL",
            duration: 2,
            to: "RDU"
        },
        {
            flightId: "92H1238M",
            captain: "Nicole Lebroski",
            airline: "JetBlue",
            from: "RDU",
            duration: 1.5,
            to: "FLL"
        },
        {
            flightId: "1293APS",
            captain: "Mark Alto",
            airline: "JetBlue",
            from: "AVL",
            duration: 1,
            to: "RDU"
        },
        {
            flightId: "1238023S",
            captain: "Edward Naths",
            airline: "Allegiant",
            from: "FLL",
            duration: 9,
            to: "CDG"
        }];

        for(let i = 0; i<flights.length; i++) {
            await this.flightsRepo.save(flights[i]);
        }
    }

    @GET('/get-flights')
    public async handler2() {
        const flightById = await this.flightsRepo.findByFlightId("AB1293");
        const flightByAirline = await this.flightsRepo.findByAirline("JetBlue");
        const flightByAirlineAndFrom = await this.flightsRepo.findByAirlineAndFrom("JetBlue", "RDU");
        const flightByFromAndTo = await this.flightsRepo.findByFromAndTo("FLL", "RDU");
        const flightByCaptainAndAirlineFalse = await this.flightsRepo.findByCaptainAndAirline("Mark Alto", "American airlines");
        const flightByCaptainAndAirlineTrue = await this.flightsRepo.findByCaptainAndAirline("Mark Alto", "JetBlue");
        const flightByFrom = await this.flightsRepo.findByFrom("AVL");
        const findAll = await this.flightsRepo.findAll();
        const countAll = await this.flightsRepo.countAll();
        const flightByFlightIdOrCaptain = await this.flightsRepo.findByFlightIdOrCaptain("NONVALID", "Edward Naths");
        const flightByFlightIdOrCaptainFalse = await this.flightsRepo.findByFlightIdOrCaptain("NONVALID", "NONVALID");
        const flightByFromOrToAndAirline = await this.flightsRepo.findByFromOrToAndAirline("NONVALID", "RDU", "JetBlue");
        const flightByFromOrToAndAirlineFLL = await this.flightsRepo.findByFromOrToAndAirline("FLL", "NONVALID", "NONVALID");
        const flightByDurationGreaterThan = await this.flightsRepo.findByDurationGreaterThan(2);
        const flightByDurationLessThan = await this.flightsRepo.findByDurationLessThan(2);
        const flightbyDurationGreaterThanORDurationLessThanAndTo = await this.flightsRepo.findByDurationGreaterThanOrDurationLessThanAndTo(2, 1.5, "RDU");
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
new MandarineCore().MVC().run({ port: 1293 });