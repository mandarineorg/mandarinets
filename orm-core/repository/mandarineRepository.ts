import { Mandarine } from "../../main-core/Mandarine.ns.ts";
import { ApplicationContext } from "../../main-core/application-context/mandarineApplicationContext.ts";

export type RepositoryModeler = {
    instance: any,
    object: any,
    entity: Mandarine.ORM.Entity.Table
};

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

}