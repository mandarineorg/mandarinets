// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { Router } from "../../deps.ts";
import { Log } from "../../logger/log.ts";
import { ApplicationContext } from "../../main-core/application-context/mandarineApplicationContext.ts";
import { Mandarine } from "../../main-core/Mandarine.ns.ts";
import type { ControllerComponent } from "../core/internal/components/routing/controllerContext.ts";
import { middlewareResolver, requestResolver } from "../core/internal/components/routing/routingResolver.ts";
import { handleCors } from "../core/middlewares/cors/corsMiddleware.ts";
import { SessionMiddleware } from "../core/middlewares/sessionMiddleware.ts";
import { AuthenticationRouting } from "../core/internal/auth/authenticationRouting.ts";
import { verifyPermissions } from "../../security-core/core/internals/permissions/verifyPermissions.ts";
import { ComponentComponent } from "../../main-core/components/component-component/componentComponent.ts";
// @ts-ignore
import { NonComponentMiddlewareTarget } from "../../main-core/internals/interfaces/middlewareTarget.ts";
import type { GuardTarget } from "../../main-core/internals/interfaces/guardTarget.ts";
// @ts-ignore
import { DI } from "../../main-core/dependency-injection/di.ns.ts";
import { MandarineException } from "../../main-core/exceptions/mandarineException.ts";
import { responseTimeHandler } from "../core/middlewares/responseTimeHeaderMiddleware.ts";
import { MiddlewareManager } from "../core/internal/middlewareManager.ts";

/**
 * This class works as the MVC engine and it is responsible for the initialization & behavior of HTTP requests.
 * It handles the initialization of controllers, routes, repository proxys, entity manager and others.
 * This class is the Mandarine Compiler since it is the most important class for the MVC framework to work as it resolves everything it needs
 */
export class MandarineMvcFrameworkStarter {
  private router: Router = new Router();
  private internalMiddlewareManager: MiddlewareManager = new MiddlewareManager();

  private logger: Log = Log.getLogger(MandarineMvcFrameworkStarter);

  // @ts-ignore
  private essentials: {
    sessionMiddleware: SessionMiddleware;
  } = {};

  constructor(callback?: Function) {
    this.logger.compiler("Starting MVC Module", "info");

    if (callback) {
      callback(this);
    }
  }

  public initializeInternalMiddleware() {
      this.internalMiddlewareManager.new({
          type: Mandarine.MandarineMVC.Internal.MiddlewareType.RESPONSE_TIME,
          caller: responseTimeHandler,
          configurationFlag: {
              key: "mandarine.server.responseTimeHeader",
              expectedValue: true
          },
          enabled: true,
          lifecycle: "ALL"
      });
    
      this.internalMiddlewareManager.new({
          type: Mandarine.MandarineMVC.Internal.MiddlewareType.SESSION_COOKIE,
          caller: this.essentials.sessionMiddleware.createSessionCookie.bind(this.essentials.sessionMiddleware),
          configurationFlag: {
              key: "mandarine.server.enableSessions",
              expectedValue: true
          },
          enabled: true,
          lifecycle: "PRE"
      });

      this.internalMiddlewareManager.new({
          type: Mandarine.MandarineMVC.Internal.MiddlewareType.CORS,
          caller: handleCors,
          configurationFlag: {
              key: "mandarine.server.enableSessions",
              expectedValue: true
          },
          enabled: true,
          lifecycle: "PRE"
      });

    this.internalMiddlewareManager.new({
        type: Mandarine.MandarineMVC.Internal.MiddlewareType.SESSION_STORE,
        caller: this.essentials.sessionMiddleware.storeSession.bind(this.essentials.sessionMiddleware),
        configurationFlag: {
            key: "mandarine.server.enableSessions",
            expectedValue: true
        },
        enabled: true,
        lifecycle: "POST"
    });
  }

  public initializeEssentials() {
    this.essentials.sessionMiddleware = new SessionMiddleware();
    this.initializeInternalMiddleware();
  }

  public intializeControllersRoutes(): void {
    let mvcControllers: Mandarine.MandarineCore.ComponentRegistryContext[] = ApplicationContext.getInstance().getComponentsRegistry().getControllers();

    if (ApplicationContext.CONTEXT_METADATA.engineMetadata?.mvc) {
      ApplicationContext.CONTEXT_METADATA.engineMetadata.mvc.controllersAmount = mvcControllers.length;
    }

    const authenticationRoute = new AuthenticationRouting();
    this.router = authenticationRoute.initialize(this.router);

    try {
      mvcControllers.forEach((component: Mandarine.MandarineCore.ComponentRegistryContext, index) => {
          let controller: ControllerComponent = <ControllerComponent>(component.componentInstance);
          controller.getActions().forEach((value, key) => {
            this.router = this.addPathToRouter(this.router, value, controller);
          });
        }
      );
    } catch (error) {
      this.logger.compiler(`Controllers could not be initialized`, "error", error);
    }
  }

  private preRequestInternalMiddlewares(context: Mandarine.Types.RequestContext, routingAction: Mandarine.MandarineMVC.Routing.RoutingAction, controllerComponent: ControllerComponent): boolean {
    return this.internalMiddlewareManager.execute(context, {
      corsOptions: controllerComponent.options.cors ? controllerComponent.options.cors : routingAction.routingOptions?.cors,
      useDefaultCors: true,
      responseTimeIsPostRequest: false
    }, "PRE");
  }

  private postRequestInternalMiddlewares(context: Mandarine.Types.RequestContext): void {
    this.internalMiddlewareManager.execute(context, {
      responseTimeIsPostRequest: true
    }, "POST");
  }

  private async executeUserMiddlewares(preRequestMiddleware: boolean, middlewares: Array<Mandarine.Types.MiddlewareComponent | NonComponentMiddlewareTarget>, context: Mandarine.Types.RequestContext): Promise<boolean> {
    for (const middlewareComponent of middlewares) {
      if (middlewareComponent instanceof ComponentComponent) {
        let middlewareResolved: boolean | undefined = undefined;
        const resolveMiddleware = async () => await middlewareResolver(preRequestMiddleware, <Mandarine.Types.MiddlewareComponent>middlewareComponent, context);
        if (middlewareComponent.configuration.regexRoute) {
          let finalRegex = new RegExp(context.request.url.host + middlewareComponent.configuration.regexRoute.source);
          if (finalRegex.test(context.request.url.host + context.request.url.pathname)) {
            middlewareResolved = (await resolveMiddleware()) || false;
          }
        } else {
          middlewareResolved = (await resolveMiddleware()) || false;
        }

        if (preRequestMiddleware && middlewareResolved === false) {
          return middlewareResolved;
        }
      } else {
        if (preRequestMiddleware) {
          const execution = middlewareComponent.onPreRequest(context.request, context.response);
          if (execution === false) return false;
        } else {
          middlewareComponent.onPostRequest(context.request, context.response);
        }
      }
    }
    return true;
  }

  private async executeUseGuards(guards: Array<GuardTarget | Function>,context: Mandarine.Types.RequestContext) {
    for (const currentGuard of guards) {
      let guardPassed: boolean = true;
      const dependency: ComponentComponent = ApplicationContext.getInstance().getDIFactory().getComponentByType(currentGuard);
      if (dependency) {
        const componentHandler = dependency.getClassHandler();
        const resolveGuardParameters: Array<any> | null = await DI.Factory.methodArgumentResolver(componentHandler, "onGuard", context);
        if (resolveGuardParameters) {
          guardPassed = await componentHandler["onGuard"](context, ...resolveGuardParameters);
        }
      } else {
        if (typeof currentGuard === "function") {
          guardPassed = await currentGuard(context);
        } else {
          throw new MandarineException(MandarineException.INVALID_GUARD_EXECUTION);
        }
      }

      if (guardPassed === false) {
        return false;
      }
    }
    return true;
  }

  private addPathToRouter(router: Router, routingAction: Mandarine.MandarineMVC.Routing.RoutingAction, controllerComponent: ControllerComponent): Router {
    let route: string = routingAction.route;

    let availableMiddlewares: Array<Mandarine.Types.MiddlewareComponent | NonComponentMiddlewareTarget> = [...Mandarine.Global.getMiddleware()];
    availableMiddlewares = availableMiddlewares.concat(routingAction.routingOptions?.middleware || []).concat(controllerComponent.options.middleware || []);

    let responseHandler = async (context: Mandarine.Types.RequestContext, next: Function) => {
      if (context.isResource) {
        await next();
        return;
      }

      let continueRequest = this.preRequestInternalMiddlewares(context, routingAction, controllerComponent); // Execute internal middleware like sessions

      const controllerPermissions = controllerComponent.options.withPermissions;
      const routePermissions = routingAction.routingOptions?.withPermissions;
      let allowed = true;

      if (controllerPermissions) {
        allowed = verifyPermissions(context.request)(controllerPermissions);
      }
      if (routePermissions && allowed) {
        allowed = verifyPermissions(context.request)(routePermissions);
      }

      const controllerGuards = controllerComponent.options.guards;
      const routeGuards = routingAction.routingOptions?.guards;

      if (allowed) {
        if (controllerGuards) {
          allowed = await this.executeUseGuards(controllerGuards, context);
        }
        if (routeGuards) {
          allowed = await this.executeUseGuards(routeGuards, context);
        }
      }

      if (!allowed) {
        context.response.status = 401;
        return;
      }

      continueRequest = continueRequest && await this.executeUserMiddlewares(true, availableMiddlewares, context); // If the user has any middleware, execute it

      if (continueRequest) {
        await requestResolver(routingAction, context);

        this.executeUserMiddlewares(false, availableMiddlewares, context);
        this.postRequestInternalMiddlewares(context);

        if (context.request.url.pathname === routingAction.route) {
          return;
        } else {
          await next();
        }
      }
    };


    router = router.options(route, <any>responseHandler);
    switch (routingAction.actionType) {
      case Mandarine.MandarineMVC.HttpMethods.GET:
        return router.get(route, <any>responseHandler);
      case Mandarine.MandarineMVC.HttpMethods.POST:
        return router.post(route, <any>responseHandler);
      case Mandarine.MandarineMVC.HttpMethods.DELETE:
        return router.delete(route, <any>responseHandler);
      case Mandarine.MandarineMVC.HttpMethods.PUT:
        return router.put(route, <any>responseHandler);
      case Mandarine.MandarineMVC.HttpMethods.PATCH:
        return router.patch(route, <any>responseHandler);
      case Mandarine.MandarineMVC.HttpMethods.HEAD:
        return router.head(route, <any>responseHandler);
    }

    return router;
  }

  public getRouter(): Router {
    return this.router;
  }
}
