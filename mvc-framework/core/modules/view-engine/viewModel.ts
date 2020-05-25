/**
 * This class serves as a modeler for templates. 
 * A modeler is used to make working with templates & its variables easier
 */
export class ViewModel {

    private attributes: Map<string, any> = new Map<string, any>();

    public setAttribute(attribute: string, value: any): void {
        this.attributes.set(attribute, value);
    }

    public deleteAttribute(attribute: string): void {
        this.attributes.delete(attribute);
    }

    public toObject(): object {
        let returnObj = {};

        Array.from(this.attributes.keys()).forEach((attributeKey) => {
            returnObj[attributeKey] = this.attributes.get(attributeKey);
        });
        return returnObj;
    }
    
}