import { ApplicationContext } from "../../main-core/application-context/mandarineApplicationContext.ts";
import { ORMCoreDecoratorProxy } from "../../orm-core/core/proxys/ormCoreDecoratorProxy.ts";
import { mockDecorator, Orange, Test, DenoAsserts } from "../mod.ts";
import { Types } from "../../orm-core/sql/types.ts";
import { MandarineRepository } from "../../orm-core/repository/mandarineRepository.ts";
import { RepositoryComponent } from "../../main-core/components/repository-component/repositoryComponent.ts";

@mockDecorator()
class MyTable {

    @mockDecorator()
    private id: number;
    @mockDecorator()
    private name: string;
    @mockDecorator()
    private isAdult: boolean;

}
export class ORMTests {

    constructor() {
        Orange.setOptions(this, {
            hooks: {
                beforeEach: () => ApplicationContext.getInstance().getComponentsRegistry().clearComponentRegistry()
            }
        })
    }

    @Test({
        name: "Create entity & columns",
        description: "Create the representation of a table with columns"
    })
    public createEntity() {
        ORMCoreDecoratorProxy.registerColumnDecorator(MyTable.prototype, undefined, "isAdult");
        ORMCoreDecoratorProxy.registerColumnDecorator(MyTable.prototype, undefined, "name");
        ORMCoreDecoratorProxy.registerColumnDecorator(MyTable.prototype, undefined, "id");
        ORMCoreDecoratorProxy.registerIdDecorator(MyTable.prototype, "id");
        ORMCoreDecoratorProxy.registerGeneratedValueDecorator(MyTable.prototype, {
            strategy: "SEQUENCE"
        }, "id");
        ORMCoreDecoratorProxy.registerTableDecorator(MyTable, {
            name: "MyTable",
            schema: "public"
        });
        let entity = ApplicationContext.getInstance().getEntityManager().entityRegistry.getEntity("public", "mytable");
        DenoAsserts.assertEquals(entity.tableName, "mytable");
        DenoAsserts.assertEquals(entity.schema, "public");
        DenoAsserts.assertEquals(entity.columns,[{
            name: "isAdult",
            length: 255,
            scale: 2,
            precision: 8,
            nullable: true,
            unique: false,
            fieldName: "isAdult",
            type: Types.BOOLEAN,
            options: {}
        },
        {
            name: "name",
            length: 255,
            scale: 2,
            precision: 8,
            nullable: true,
            unique: false,
            fieldName: "name",
            type: Types.VARCHAR,
            options: {}
        },
        {
            name: "id",
            length: 255,
            scale: 2,
            precision: 8,
            nullable: false,
            unique: true,
            fieldName: "id",
            type: Types.BIGINT,
            options: {
                primaryKey: true,
                generatedValue: {
                    strategy: "SEQUENCE"
                }
            },
            incrementStrategy: true
        }]);
        DenoAsserts.assertEquals(entity.uniqueConstraints, [{
            name: "id",
            length: 255,
            scale: 2,
            precision: 8,
            nullable: false,
            unique: true,
            fieldName: "id",
            type: Types.BIGINT,
            options: { 
                primaryKey: true, 
                generatedValue: {
                    strategy: "SEQUENCE"
                }   
            },
            incrementStrategy: true
          }]);
        DenoAsserts.assertEquals(entity.primaryKey, {
            name: "id",
            length: 255,
            scale: 2,
            precision: 8,
            nullable: false,
            unique: true,
            fieldName: "id",
            type: Types.BIGINT,
            options: { 
                primaryKey: true, 
                generatedValue: {
                    strategy: "SEQUENCE"
                }   
            },
            incrementStrategy: true
        });
    }

    @Test({
        name: "Create repository component",
        description: "Create a mandarine-powered repository"
    })
    public createRepository() {

        let myTable = this.createEntity();

        @mockDecorator()
        class MyRepository extends MandarineRepository<any> {
            constructor() {
                super(MyTable);
            }
        }

        ORMCoreDecoratorProxy.registerComponentRepositoryDecorator(MyRepository);
        ApplicationContext.getInstance().getComponentsRegistry().connectRepositoriesToProxy();
        ApplicationContext.getInstance().getComponentsRegistry().resolveDependencies();
        let repository = ApplicationContext.getInstance().getComponentsRegistry().get("MyRepository");
        DenoAsserts.assert(repository.componentInstance instanceof RepositoryComponent)
        let handler = repository.componentInstance.getClassHandler();
        DenoAsserts.assert(typeof handler.save === 'function');
        DenoAsserts.assert(typeof handler.findAll === 'function');
        DenoAsserts.assert(typeof handler.deleteAll === 'function');
        DenoAsserts.assert(typeof handler.countAll === 'function');
    }

}