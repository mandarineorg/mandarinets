import { ApplicationContext } from "../../main-core/application-context/mandarineApplicationContext.ts";
import { Mandarine } from "../../main-core/Mandarine.ns.ts";

export type RepositoryModeler = {
    instance: any,
    object: any,
    entity: Mandarine.ORM.Entity.Table
};


 /**
* Repositories must extend to this class.
* This class makes interaction beetween the database layer & mandarine engine possible.
* This class is generic where T equals your model.
* This class has a parameter in its constructor, which should be your model's instance.
*
*  `@Repository()
    abstract class usersRepository extends MandarineRepository<MyModel> {

                constructor() {
                    super(MyModel);
                }
    }`
 */  
export abstract class MandarineRepository<T> {

    private modeler: RepositoryModeler;

    constructor(TCreator: { new (): T; }) {
        this.modeler = {
            instance: TCreator,
            object: new TCreator(),
            entity: undefined
        };
        
        this.modeler.entity = ApplicationContext.getInstance().getEntityManager().entityRegistry.findEntityByInstanceType(this.modeler.instance);
     }

     public getModeler(): RepositoryModeler {
         return this.modeler;
     }

     public save(model: T) {}
     public findAll() {}
     public deleteAll() {}
     public countAll() {}

}