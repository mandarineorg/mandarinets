import { Mandarine } from "../../../main-core/Mandarine.ns.ts";
import { Sha256 } from "../../../security-core/hash/sha256.ts";

export class TemplateUtils {
    public static getTemplateKey(renderData: Mandarine.MandarineMVC.TemplateEngine.Decorators.RenderData | string): string {
        let key: string;
        if(typeof renderData === 'object') {
            let manual: boolean = renderData.options != undefined && renderData.options.manual == true;
            if(manual) {
                key = new Sha256().update(renderData.template).toString();
            } else {
                key = renderData.template;
            }
        } else {
            key = new Sha256().update(renderData).toString();
        }
        return key;
    }
}