import { MandarineRepository } from "../orm-core/repository/mandarineRepository.ts";
import { Controller } from "../mvc-framework/core/decorators/stereotypes/controller/controller.ts";
import { Inject } from "../main-core/dependency-injection/decorators/Inject.ts";
import { GET } from "../mvc-framework/core/decorators/stereotypes/controller/routingDecorator.ts";
import { Table, Column, Id, GeneratedValue } from "../orm-core/core/decorators/entityDecorators.ts";
import { Repository, CustomQuery } from "../orm-core/core/decorators/Repository.ts";
import { MandarineCore } from "../main-core/mandarineCore.ts";

@Table({
    schema: "public"
})
class Users {

    @Column()
    @Id()
    @GeneratedValue({strategy: "SEQUENCE"})
    public id: number;

    @Column()
    public firstname: string;

    @Column()
    public lastname: string;

    @Column()
    public country: string;

    constructor(firstname?: string, lastname?: string, country?: string) {
        this.firstname = firstname;
        this.lastname = lastname;
        this.country = country;
    }

}

@Repository()
abstract class usersRepository extends MandarineRepository<Users> {

    constructor() {
        super(Users);
    }
    
    public findByCountry(country: string) {}
    public findByFirstnameAndCountry(firstname: string, country: string) {}
    public countByCountry(country: string) {}
    public existsByLastname(lastname: string) {}
    public findByCountryIsNotNull(){}
    public findByCountryIsNull() {}
    public findByFirstnameIsNotEmptyAndCountryIsEmpty() {}
    public findByLastnameStartingWith(lastname: string) {}
    public findByLastnameAndCountryLikeAndFirstnameEndsWith(lastname: string, country: string, firstname: string) {}
    public findByFirstnameAndCountryAndLastnameEndsWithAndFirstnameIsNotNullOrLastnameIsNullAndCountryLike() {}

    @CustomQuery("SELECT * FROM public.users WHERE country = $1 AND firstname = 'Andres'")
    public myCustomQuery(country: string) {}
}

@Controller()
export class myController {

    @Inject()
    private repository: usersRepository;

    @GET('/add-people')
    public async handleAddPeople() {
        let user1 = new Users("Anastasov", "Lewin", "Croatia");
        // let user2 = new Users("Anastasia", "Skymonov", "Russia");
        // let user3 = new Users("Bill", "Gates", "United States");

        await this.repository.save(user1);
        // await this.repository.save(user2);
        // await this.repository.save(user3);

        return true;
    }

    @GET('/handle-new-operators')
    public handleNewOperators() {
        this.repository.findByCountry("United States");
        this.repository.findByFirstnameAndCountry("Anastasov", "Croatia");
        this.repository.findByCountryIsNotNull();
        this.repository.countAll();
        this.repository.countByCountry("Russia");
        this.repository.findByCountryIsNull();
        this.repository.findByFirstnameIsNotEmptyAndCountryIsEmpty();
        this.repository.findByLastnameStartingWith("Pirela");
        this.repository.countByCountry("United States");
        this.repository.findByLastnameAndCountryLikeAndFirstnameEndsWith("Pirela", "United", "res");
        this.repository.existsByLastname("Gates");
    }

    @GET('/update')
    public async updateRecord() {
        let anastasia = await this.repository.findByFirstnameAndCountry("Anastasov", "Croatia");
        let model = <Users> anastasia[0];
        model.firstname = "Anastasov";
        model.lastname = "Emerenkov";
        model.country = "United States";
        return await this.repository.save(model);
    }

    @GET('/get-people-from-united-states')
    public async handleGetPeopleFromUnitedStates() {
        return await this.repository.findByCountry("United States");
    }

    @GET('/count-all')
    public async handleCountAll() {
        return await this.repository.countAll();
    }

    @GET('/count-russia')
    public async handleCountRussia() {
        return await this.repository.countByCountry("Russia");
    }

    @GET('/find-anastasia')
    public async handleFindAnastasia() {
        return await this.repository.findByFirstnameAndCountry("Anastasia", "Russia");
    }

    @GET('/count-united-states')
    public async countUnitedStatesPeople() {
        return await this.repository.countByCountry("United States");
    }

    @GET('/exists-by-last-name')
    public async existsByLastname() {
        return await this.repository.existsByLastname("Gates");
    }


    @GET('/custom-query')
    public async customQueryHandler() {
        return await this.repository.myCustomQuery("United States");
    }
}
MandarineCore.setConfiguration('./config.json');
new MandarineCore().MVC().run();