// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { ApplicationContext } from "../../main-core/application-context/mandarineApplicationContext.ts";
import { ORMCoreDecoratorProxy } from "../../orm-core/core/proxys/ormCoreDecoratorProxy.ts";
import { mockDecorator, Orange, Test, DenoAsserts } from "../mod.ts";
import { Types } from "../../orm-core/sql/types.ts";
import { MandarineRepository } from "../../orm-core/repository/mandarineRepository.ts";
import { RepositoryComponent } from "../../main-core/components/repository-component/repositoryComponent.ts";
import { lexicalProcessor } from "../../orm-core/core/lexicalProcessor.ts";
import { PostgreSQLDialect } from "../../orm-core/dialect/postgreSQLDialect.ts";
import type { Mandarine } from "../../main-core/Mandarine.ns.ts";

@mockDecorator()
class MyTable {

    @mockDecorator()
    //@ts-ignore
    private id: number;
    @mockDecorator()
    //@ts-ignore
    private name: string;
    @mockDecorator()
    //@ts-ignore
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
        ORMCoreDecoratorProxy.registerColumnDecorator(MyTable.prototype, <any><unknown> undefined, "isAdult");
        ORMCoreDecoratorProxy.registerColumnDecorator(MyTable.prototype, <any><unknown> undefined, "name");
        ORMCoreDecoratorProxy.registerColumnDecorator(MyTable.prototype, <any><unknown> undefined, "id");
        ORMCoreDecoratorProxy.registerIdDecorator(MyTable.prototype, "id");
        ORMCoreDecoratorProxy.registerGeneratedValueDecorator(MyTable.prototype, {
            strategy: "SEQUENCE"
        }, "id");
        ORMCoreDecoratorProxy.registerTableDecorator(MyTable, {
            name: "MyTable",
            schema: "public"
        });
        let entity = ApplicationContext.getInstance().getEntityManager().entityRegistry.getEntity("public", "mytable");
        DenoAsserts.assertEquals(entity?.tableName, "mytable");
        DenoAsserts.assertEquals(entity?.schema, "public");
        DenoAsserts.assertEquals(entity?.columns,[{
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
        DenoAsserts.assertEquals(entity?.uniqueConstraints, [{
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
        DenoAsserts.assertEquals(entity?.primaryKey, {
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
        DenoAsserts.assert(repository?.componentInstance instanceof RepositoryComponent)
        let handler = repository.componentInstance.getClassHandler();
        DenoAsserts.assert(typeof handler.save === 'function');
        DenoAsserts.assert(typeof handler.findAll === 'function');
        DenoAsserts.assert(typeof handler.deleteAll === 'function');
        DenoAsserts.assert(typeof handler.countAll === 'function');
    }

    @Test({
        name: "Lexical processor",
        description: "Should create SQL queries"
    })
    public useLexicalProcessor() {

        // @ts-ignore
        const fakeRepositoryProxy: Mandarine.ORM.RepositoryProxy = {
            SUPPORTED_KEYWORDS: ["and", "or", "isnotnull", "isnull", "isempty", "isnotempty", "startingwith", "endswith", "like", "greaterthan", "lessthan"]
        };

        const fakeTableMetadata = {
            name: "users",
            schema: "public"
        };

        // @ts-ignore
        const fakeEntity: Mandarine.ORM.Entity.Table = {
            columns: [
                {
                    name: "id"
                },
                {
                    name: "firstname"
                },
                {
                    name: "lastname"
                },
                {
                    name: "age"
                },
                {
                    name: "posts"
                },
                {
                    name: "country"
                },
                {
                    name: "CarModEl"
                }
            ]
        }

        const dialect = new PostgreSQLDialect();

        const countByCountry = lexicalProcessor(fakeRepositoryProxy, "countByCountry", "countBy", fakeTableMetadata, fakeEntity, dialect);
        DenoAsserts.assertEquals(countByCountry, `SELECT COUNT(*) FROM public.users WHERE "country" = $1`);

        const findByCountry = lexicalProcessor(fakeRepositoryProxy, "findByCountry", "findBy", fakeTableMetadata, fakeEntity, dialect);
        DenoAsserts.assertEquals(findByCountry, `SELECT * FROM public.users WHERE "country" = $1`);

        const findByFirstnameAndCountry = lexicalProcessor(fakeRepositoryProxy, "findByFirstnameAndCountry", "findBy", fakeTableMetadata, fakeEntity, dialect);
        DenoAsserts.assertEquals(findByFirstnameAndCountry, `SELECT * FROM public.users WHERE "firstname" = $1 AND "country" = $2`);

        const findByCountryIsNotNull = lexicalProcessor(fakeRepositoryProxy, "findByCountryIsNotNull", "findBy", fakeTableMetadata, fakeEntity, dialect);
        DenoAsserts.assertEquals(findByCountryIsNotNull, `SELECT * FROM public.users WHERE "country" IS NOT NULL`);

        const findByCountryIsNull = lexicalProcessor(fakeRepositoryProxy, "findByCountryIsNull", "findBy", fakeTableMetadata, fakeEntity, dialect);
        DenoAsserts.assertEquals(findByCountryIsNull, `SELECT * FROM public.users WHERE "country" IS NULL`);

        const findByFirstnameIsNotEmptyAndCountryIsEmpty = lexicalProcessor(fakeRepositoryProxy, "findByFirstnameIsNotEmptyAndCountryIsEmpty", "findBy", fakeTableMetadata, fakeEntity, dialect);
        DenoAsserts.assertEquals(findByFirstnameIsNotEmptyAndCountryIsEmpty, `SELECT * FROM public.users WHERE "firstname" <> '' AND "country" = ''`);

        const findByLastnameStartingWith = lexicalProcessor(fakeRepositoryProxy, "findByLastnameStartingWith", "findBy", fakeTableMetadata, fakeEntity, dialect);
        DenoAsserts.assertEquals(findByLastnameStartingWith, `SELECT * FROM public.users WHERE "lastname" LIKE '' || $1 || '%'`);

        const findByLastnameAndCountryLikeAndFirstnameEndsWith = lexicalProcessor(fakeRepositoryProxy, "findByLastnameAndCountryLikeAndFirstnameEndsWith", "findBy", fakeTableMetadata, fakeEntity, dialect);
        DenoAsserts.assertEquals(findByLastnameAndCountryLikeAndFirstnameEndsWith, `SELECT * FROM public.users WHERE "lastname" = $1 AND "country" LIKE '%' || $2 || '%' AND "firstname" LIKE '%' || $3 || ''`);

        const findByFirstnameAndCountryAndLastnameEndsWithAndFirstnameIsNotNullOrLastnameIsNullAndCountryLike = lexicalProcessor(fakeRepositoryProxy, "findByFirstnameAndCountryAndLastnameEndsWithAndFirstnameIsNotNullOrLastnameIsNullAndCountryLike", "findBy", fakeTableMetadata, fakeEntity, dialect);
        DenoAsserts.assertEquals(findByFirstnameAndCountryAndLastnameEndsWithAndFirstnameIsNotNullOrLastnameIsNullAndCountryLike, `SELECT * FROM public.users WHERE "firstname" = $1 AND "country" = $2 AND "lastname" LIKE '%' || $3 || '' AND "firstname" IS NOT NULL OR "lastname" IS NULL AND "country" LIKE '%' || $4 || '%'`);
    
        const findByFirstnameAndAgeGreaterThanAndPostsLessThanOrPostsGreaterThan = lexicalProcessor(fakeRepositoryProxy, "findByFirstnameAndAgeGreaterThanAndPostsLessThanOrPostsGreaterThan", "findBy", fakeTableMetadata, fakeEntity, dialect);
        DenoAsserts.assertEquals(findByFirstnameAndAgeGreaterThanAndPostsLessThanOrPostsGreaterThan, `SELECT * FROM public.users WHERE "firstname" = $1 AND "age" > $2 AND "posts" < $3 OR "posts" > $4`);

        const findByCarmodel = lexicalProcessor(fakeRepositoryProxy, "findByCarModel", "findBy", fakeTableMetadata, fakeEntity, dialect);
        DenoAsserts.assertEquals(findByCarmodel, `SELECT * FROM public.users WHERE "CarModEl" = $1`);
    }

}