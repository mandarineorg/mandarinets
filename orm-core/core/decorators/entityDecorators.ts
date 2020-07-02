import { Mandarine } from "../../../mod.ts";
import { OrmCoreDecoratorsProxy } from "../../proxys/ormCoreDecorators.ts";

/**
 * **Decorator**
 * 
 * Defines that a class is an entity in Mandarine's ORM
 *
 * `@Table(decoratorOptions)
 *  Target: class`
 */
export const Table = (decoratorOptions: Mandarine.ORM.Entity.Decorators.Table): Function => {
    return (target: any) => {
        //ApplicationContext.getInstance().getEntityManager().entityRegistry.register(decoratorOptions.schema, target, decoratorOptions.name);
        // WILL FAIL
        OrmCoreDecoratorsProxy.registerTableDecorator();
    }
}

/**
 * **Decorator**
 * 
 * Defines that a property is a column in an entity.
 *
 * `@Column(decoratorOptions)
 *  Target: property`
 */
export const Column = (decoratorOptions?: Mandarine.ORM.Entity.Decorators.Column): Function => {
    return (target: any, propertyKey: string) => {
       // OrmCoreDecoratorsProxy.registerColumnDecorator(target, decoratorOptions, propertyKey);
    }
}

/**
 * **Decorator**
 * 
 * Defines that a column is a primary key
 *
 * `@Id()
 *  Target: property`
 */
export const Id = () => {
    return (target: any, propertyKey: string) => {
       // Reflect.defineMetadata(`${MandarineConstants.REFLECTION_MANDARINE_TABLE_COLUMN_PROPERTY}:${propertyKey}:primaryKey`, true, target, propertyKey);
    }
}

/**
 * **Decorator**
 * 
 * Defines the generation strategy for a primary key
 *
 * `@GeneratedValue()
 *  Target: property`
 */
export const GeneratedValue = (decoratorOptions: Mandarine.ORM.Entity.Decorators.GeneratedValue) => {
    return (target: any, propertyKey: string) => {
     //   Reflect.defineMetadata(`${MandarineConstants.REFLECTION_MANDARINE_TABLE_COLUMN_PROPERTY}:${propertyKey}:generatedValue`, decoratorOptions, target, propertyKey);
    }
}