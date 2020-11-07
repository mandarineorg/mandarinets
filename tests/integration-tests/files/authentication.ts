// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { Override } from "../../../main-core/decorators/native-components/override.ts";
import { Service } from "../../../main-core/decorators/stereotypes/service/service.ts";
import { MandarineResourceResolver } from "../../../main-core/mandarine-native/mvc/mandarineResourceResolver.ts";
import { Mandarine } from "../../../main-core/Mandarine.ns.ts";
import { MandarineCore } from "../../../main-core/mandarineCore.ts";
import { Controller } from "../../../mvc-framework/core/decorators/stereotypes/controller/controller.ts";
import { AuthPrincipal } from "../../../mvc-framework/core/decorators/stereotypes/controller/parameterDecorator.ts";
import { GET } from "../../../mvc-framework/core/decorators/stereotypes/controller/routingDecorator.ts";
import { ResourceHandler } from "../../../mvc-framework/core/internal/components/resource-handler-registry/resourceHandler.ts";
import { AllowOnly } from "../../../security-core/core/decorators/allowOnly.ts";

@Service()
export class authmanagerservice implements Mandarine.Security.Auth.UserDetailsService {

    public users = [{
        get roles() {
            return ["ADMIN", "MODERATOR"]
        },
        get password() {
            return "$2a$10$q9ndDolU5EM0PFy1Zu2I7Ougcw/oHrkB8/mCBf01Fuae6okON.61O"
        },
        get username() {
            return "test"
        },
        get uid() {
            return 1
        },
        get accountExpired() {
            return false
        },
        get accountLocked() {
            return false
        },
        get credentialsExpired() {
            return false
        },
        get enabled() {
            return true
        }
    },
    {
        get roles() {
            return ["ADMIN"]
        },
        get password() {
            return "$2a$10$q9ndDolU5EM0PFy1Zu2I7Ougcw/oHrkB8/mCBf01Fuae6okON.61O"
        },
        get username() {
            return "test2"
        },
        get uid() {
            return 2
        },
        get accountExpired() {
            return false
        },
        get accountLocked() {
            return false
        },
        get credentialsExpired() {
            return false
        },
        get enabled() {
            return true
        }
    },
    {
        get roles() {
            return ["USER"]
        },
        get password() {
            return "$2a$10$q9ndDolU5EM0PFy1Zu2I7Ougcw/oHrkB8/mCBf01Fuae6okON.61O"
        },
        get username() {
            return "test3"
        },
        get uid() {
            return 2
        },
        get accountExpired() {
            return false
        },
        get accountLocked() {
            return false
        },
        get credentialsExpired() {
            return false
        },
        get enabled() {
            return true
        }
    },
    {
        get roles() {
            return ["MODERATOR"]
        },
        get password() {
            return "$2a$10$q9ndDolU5EM0PFy1Zu2I7Ougcw/oHrkB8/mCBf01Fuae6okON.61O"
        },
        get username() {
            return "test4"
        },
        get uid() {
            return 2
        },
        get accountExpired() {
            return false
        },
        get accountLocked() {
            return false
        },
        get credentialsExpired() {
            return false
        },
        get enabled() {
            return true
        }
    }];

    public loadUserByUsername(username: any) {
        return this.users.find((item) => item.username === username)
    }
}

@Override()
export class WebMvcConfigurer extends Mandarine.Native.WebMvcConfigurer {

    public authManagerBuilder(provider: Mandarine.Security.Auth.AuthenticationManagerBuilder) {
        provider = provider.userDetailsService(authmanagerservice);
        return provider;
    }

    public httpLoginBuilder(provider: Mandarine.Security.Core.Modules.LoginBuilder) {
        provider
        .loginProcessingUrl("/login")
        .loginUsernameParameter("username")
        .loginPasswordParameter("password")
        .logoutUrl("/logout")
        return provider;
    }

    public addResourceHandlers(): Mandarine.MandarineCore.IResourceHandlerRegistry {
        let resourceHandlerRegistry = Mandarine.Global.getResourceHandlerRegistry().getNew();
        
        resourceHandlerRegistry.addResourceHandler(
            new ResourceHandler()
            .addResourceHandler(new RegExp("/docs/(.*)"))
            .addResourceHandlerLocation("./docs")
            .addResourceResolver(new MandarineResourceResolver())
        );

        return resourceHandlerRegistry;
    }

}

@Controller()
export class api {

    @GET("/test-endpoint")
    public handler(@AuthPrincipal() principal: any) {
        return principal;
    }

}

@Controller()
@AllowOnly(["isAuthenticated()"])
export class allowonlyclass {

    @GET("/only-admins")
    @AllowOnly(["ADMIN"])
    public handler1() {
        return "You are admin and are authenticated";
    }

    @GET("/admin-moderators")
    @AllowOnly(["MODERATOR"])
    public handler2() {
        return "You are moderator and are authenticated";
    }

    @GET("/user")
    public handler3() {
        return "You just need to be logged-in";
    }

}

@Controller()
export class noauth {
    @GET('/hello-world')
    public handler1() {
        return "No auth needed";
    }
}

@Controller()
@AllowOnly(["isAuthenticated()", "ADMIN"])
export class mycontroller {
    @GET('/authenticated-and-admin')
    public handler() {
        return "You are authenticated and are admin";
    }
}

@Controller()
@AllowOnly(["isAuthenticated()", "MODERATOR", "ADMIN"])
export class anothercontroller {
    @GET('/another-controller')
    public handler() {
        return "You are authenticated and are either admin or moderator";
    }
}

@Controller()
@AllowOnly(["ADMIN"])
export class adminController {
    @GET("/are-admin")
    public handler() {
        return "You are admin";
    }
}


@Controller()
@AllowOnly(["MODERATOR"])
export class moderatoradmin {
    @GET("/moderator-admin")
    @AllowOnly(["ADMIN"])
    public handler() {
        return "You are moderator & admin";
    }

    @GET('/only-moderator-h')
    public handler2() {
        return "You are just a moderator";
    }
}

@Controller()
@AllowOnly(["ADMIN"])
export class adminmoderator {
    @GET("/admin-moderator")
    @AllowOnly(["MODERATOR"])
    public handler() {
        return "You are moderator & admin";
    }

    @GET('/only-admin-h')
    public handler2() {
        return "You are just a moderator";
    }
}

@Controller()
export class lastcontroller {

    @GET('/security-expressions')
    @AllowOnly("isAuthenticated() && hasRole('USER')")
    public handler() {
        return "You are authenticated and have role USER"
    }

    @GET('/security-expressions-2')
    @AllowOnly("isAuthenticated() && hasRole('USER') || hasRole('ADMIN')")
    public handler2() {
        return "You are authenticated and have role USER oR ADMIN"
    }

    @GET('/security-expressions-3')
    @AllowOnly("isAuthenticated()")
    public handler3() {
        return "just gotta be authenticated"
    }

    @GET('/security-expressions-4')
    @AllowOnly(["isAuthenticated()", "hasRole('X')"])
    public handler4() {
        return "just gotta be authenticated"
    }

    @GET('/security-expressions-5')
    @AllowOnly(["hasRole('ADMIN')"])
    public handler5() {
        return "just gotta be admin"
    }
}

new MandarineCore().MVC().run( { port: 1227 });