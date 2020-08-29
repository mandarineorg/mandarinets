import { Mandarine } from "../../../main-core/Mandarine.ns.ts";

export class MandarineMVCUtils {
    public static buildRequestContextAccessor(context: Mandarine.Types.RequestContext): Mandarine.Types.RequestContextAcessor {
        return {
            getFullContext: () => context,
            getRequest: () => context.request,
            getResponse: () => context.response
        };
    }
}