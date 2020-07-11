import { ApplicationContext } from "../../main-core/application-context/mandarineApplicationContext.ts";
import { DI } from "../../main-core/dependency-injection/di.ns.ts";
import { Mandarine } from "../../main-core/Mandarine.ns.ts";
import { ControllerComponent } from "../../mvc-framework/core/internal/components/routing/controllerContext.ts";
import { ViewModel } from "../../mvc-framework/core/modules/view-engine/viewModel.ts";
import { MVCDecoratorsProxy } from "../../mvc-framework/core/proxys/mvcCoreDecorators.ts";
import { MandarineMvcFrameworkStarter } from "../../mvc-framework/engine/mandarineMvcFrameworkStarter.ts";
import { MandarineMvc } from "../../mvc-framework/mandarine-mvc.ns.ts";
import { DenoAsserts, mockDecorator, Orange, Test } from "../mod.ts";

export class HttpHandlersTest {

    constructor() {
        Orange.setOptions(this, {
            hooks: {
                beforeEach: () => ApplicationContext.getInstance().getComponentsRegistry().clearComponentRegistry()
            }
        })
    }

    @Test({
        name: "Test HTTP Route Creation",
        description: "Test the creation for every type of route (GET, POST...)"
    })
    public testHTTPRouteCreation() {

        @mockDecorator()
        class MyControllerWithRoutes {

            @mockDecorator()
            public getRoute() {
            }

            @mockDecorator()
            public postRoute() {
            }

            @mockDecorator()
            public putRoute() {
            }

            @mockDecorator()
            public deleteRoute() {
            }

            @mockDecorator()
            public headRoute() {
            }

            @mockDecorator()
            public optionsRoute() {
            }

            @mockDecorator()
            public patchRoute() {
            }
        }

        MVCDecoratorsProxy.registerHttpAction("/api-get", MandarineMvc.HttpMethods.GET, MyControllerWithRoutes.prototype, "getRoute", undefined);
        MVCDecoratorsProxy.registerHttpAction("/api-post", MandarineMvc.HttpMethods.POST, MyControllerWithRoutes.prototype, "postRoute", undefined);
        MVCDecoratorsProxy.registerHttpAction("/api-put", MandarineMvc.HttpMethods.PUT, MyControllerWithRoutes.prototype, "putRoute", undefined);
        MVCDecoratorsProxy.registerHttpAction("/api-delete", MandarineMvc.HttpMethods.DELETE, MyControllerWithRoutes.prototype, "deleteRoute", undefined);
        MVCDecoratorsProxy.registerHttpAction("/api-head", MandarineMvc.HttpMethods.HEAD, MyControllerWithRoutes.prototype, "headRoute", undefined);
        MVCDecoratorsProxy.registerHttpAction("/api-options", MandarineMvc.HttpMethods.OPTIONS, MyControllerWithRoutes.prototype, "optionsRoute", undefined);
        MVCDecoratorsProxy.registerHttpAction("/api-patch", MandarineMvc.HttpMethods.PATCH, MyControllerWithRoutes.prototype, "patchRoute", undefined);
        MVCDecoratorsProxy.registerControllerComponent(MyControllerWithRoutes, undefined);
        ApplicationContext.getInstance().getComponentsRegistry().initializeControllers();
        new MandarineMvcFrameworkStarter()["intializeControllersRoutes"]();
        let actions: Map<String, Mandarine.MandarineMVC.Routing.RoutingAction> = ApplicationContext.getInstance().getComponentsRegistry().get("MyControllerWithRoutes").componentInstance.getActions();
        DenoAsserts.assertArrayContains(Array.from(actions.values()), [
              {
                actionParent: "MyControllerWithRoutes",
                actionType: 0,
                actionMethodName: "getRoute",
                route: "/api-get",
                routingOptions: {},
                initializationStatus: 1,
                routeParams: []
              },
              {
                actionParent: "MyControllerWithRoutes",
                actionType: 1,
                actionMethodName: "postRoute",
                route: "/api-post",
                routingOptions: {},
                initializationStatus: 1,
                routeParams: []
              },
              {
                actionParent: "MyControllerWithRoutes",
                actionType: 2,
                actionMethodName: "putRoute",
                route: "/api-put",
                routingOptions: {},
                initializationStatus: 1,
                routeParams: []
              },
              {
                actionParent: "MyControllerWithRoutes",
                actionType: 4,
                actionMethodName: "deleteRoute",
                route: "/api-delete",
                routingOptions: {},
                initializationStatus: 1,
                routeParams: []
              },
              {
                actionParent: "MyControllerWithRoutes",
                actionType: 3,
                actionMethodName: "headRoute",
                route: "/api-head",
                routingOptions: {},
                initializationStatus: 1,
                routeParams: []
              },
              {
                actionParent: "MyControllerWithRoutes",
                actionType: 6,
                actionMethodName: "optionsRoute",
                route: "/api-options",
                routingOptions: {},
                initializationStatus: 1,
                routeParams: []
              },
              {
                actionParent: "MyControllerWithRoutes",
                actionType: 5,
                actionMethodName: "patchRoute",
                route: "/api-patch",
                routingOptions: {},
                initializationStatus: 1,
                routeParams: []
              }
        ]);
    }

    @Test({
        name: "Test HTTP @QueryParam",
        description: "Test the creation & use of `@QueryParam`"
    })
    public async testHTTPQueryParamDecorator() {

        @mockDecorator()
        class MyController {
            
            @mockDecorator()
            public getRoute(invalidParam, invalidParam2, nameQueryParam, invalidParam3, frameworkQueryParam) {
            }

        }

        MVCDecoratorsProxy.registerHttpAction("/api-get", MandarineMvc.HttpMethods.GET, MyController.prototype, "getRoute", undefined);
        MVCDecoratorsProxy.registerRoutingParam(MyController.prototype, DI.InjectionTypes.QUERY_PARAM, "getRoute", 2, "name");
        MVCDecoratorsProxy.registerRoutingParam(MyController.prototype, DI.InjectionTypes.QUERY_PARAM, "getRoute", 4, "framework");
        MVCDecoratorsProxy.registerControllerComponent(MyController, undefined);
        ApplicationContext.getInstance().getComponentsRegistry().resolveDependencies();
        ApplicationContext.getInstance().getComponentsRegistry().initializeControllers();
        let controller: ControllerComponent = ApplicationContext.getInstance().getComponentsRegistry().get("MyController").componentInstance;
        let actions: Map<String, Mandarine.MandarineMVC.Routing.RoutingAction> = controller.getActions();
        let action = actions.get(controller.getActionName("getRoute"));
        let args = await DI.Factory.methodArgumentResolver(controller.getClassHandler(), action.actionMethodName, <any> {
            request: {
                url: new URL("http://localhost/api-get?name=testing&framework=Mandarine")
            }
        });
        // We test undefined parameters because order should not matter
        DenoAsserts.assertEquals(args, [undefined, undefined, "testing", undefined, "Mandarine"]);
    }

    @Test({
        name: "Test HTTP @RouteParam",
        description: "Test the creation & use of `@RouteParam`"
    })
    public async testHTTPRouteParamDecorator() {

        @mockDecorator()
        class MyController {
            
            @mockDecorator()
            public getRoute(invalidParam, nameRouteParam, lastnameRouteParam, lastInvalidParam) {
            }

        }

        MVCDecoratorsProxy.registerHttpAction("/api-get/:name/:lastname", MandarineMvc.HttpMethods.GET, MyController.prototype, "getRoute", undefined);
        MVCDecoratorsProxy.registerRoutingParam(MyController.prototype, DI.InjectionTypes.ROUTE_PARAM, "getRoute", 1, "name");
        MVCDecoratorsProxy.registerRoutingParam(MyController.prototype, DI.InjectionTypes.ROUTE_PARAM, "getRoute", 2, "lastname");
        MVCDecoratorsProxy.registerControllerComponent(MyController, undefined);
        ApplicationContext.getInstance().getComponentsRegistry().resolveDependencies();
        ApplicationContext.getInstance().getComponentsRegistry().initializeControllers();
        let controller: ControllerComponent = ApplicationContext.getInstance().getComponentsRegistry().get("MyController").componentInstance;
        let actions: Map<String, Mandarine.MandarineMVC.Routing.RoutingAction> = controller.getActions();
        let action = actions.get(controller.getActionName("getRoute"));
        let args = await DI.Factory.methodArgumentResolver(controller.getClassHandler(), action.actionMethodName, <any> {
            request: {
                url: new URL("http://localhost/api-get/Steve/Jobs")
            },
            params: {
                name: "Steve",
                lastname: "Jobs"
            }
        });

        DenoAsserts.assertEquals(args, [undefined, "Steve", "Jobs", undefined]);
    }

    @Test({
        name: "Test HTTP @Session",
        description: "Test the creation & use of `@Session`"
    })
    public async testHTTPSessionDecorator() {

        @mockDecorator()
        class MyController {
            
            @mockDecorator()
            public getRoute(invalidParam, mySession) {
            }

        }

        MVCDecoratorsProxy.registerHttpAction("/api-get", MandarineMvc.HttpMethods.GET, MyController.prototype, "getRoute", undefined);
        MVCDecoratorsProxy.registerRoutingParam(MyController.prototype, DI.InjectionTypes.SESSION_PARAM, "getRoute", 1, undefined);
        MVCDecoratorsProxy.registerControllerComponent(MyController, undefined);
        ApplicationContext.getInstance().getComponentsRegistry().resolveDependencies();
        ApplicationContext.getInstance().getComponentsRegistry().initializeControllers();
        let controller: ControllerComponent = ApplicationContext.getInstance().getComponentsRegistry().get("MyController").componentInstance;
        let actions: Map<String, Mandarine.MandarineMVC.Routing.RoutingAction> = controller.getActions();
        let action = actions.get(controller.getActionName("getRoute"));

        let args = await DI.Factory.methodArgumentResolver(controller.getClassHandler(), action.actionMethodName, <any> {
            request: {
                url: new URL("http://localhost/api-get"),
                session: {}
            }
        });

        DenoAsserts.assertEquals(args, [undefined, {}]);
        let session = args[1];
        DenoAsserts.assertEquals(session.times, undefined);
        session.times = 0;
        DenoAsserts.assertEquals(args[1].times, 0);
        session.times = 1;
        DenoAsserts.assertEquals(args[1].times, 1);

    }

    @Test({
        name: "Test HTTP @ViewModel",
        description: "Test the creation & use of `@ViewModel`"
    })
    public async testHTTPViewModelDecorator() {

        @mockDecorator()
        class MyController {
            
            @mockDecorator()
            public getRoute(invalidParam, myTemplateModel) {
            }

        }

        MVCDecoratorsProxy.registerHttpAction("/api-get", MandarineMvc.HttpMethods.GET, MyController.prototype, "getRoute", undefined);
        MVCDecoratorsProxy.registerRoutingParam(MyController.prototype, DI.InjectionTypes.TEMPLATE_MODEL_PARAM, "getRoute", 1, undefined);
        MVCDecoratorsProxy.registerControllerComponent(MyController, undefined);
        ApplicationContext.getInstance().getComponentsRegistry().resolveDependencies();
        ApplicationContext.getInstance().getComponentsRegistry().initializeControllers();
        let controller: ControllerComponent = ApplicationContext.getInstance().getComponentsRegistry().get("MyController").componentInstance;
        let actions: Map<String, Mandarine.MandarineMVC.Routing.RoutingAction> = controller.getActions();
        let action = actions.get(controller.getActionName("getRoute"));

        let args = await DI.Factory.methodArgumentResolver(controller.getClassHandler(), action.actionMethodName, <any> {
            request: {
                url: new URL("http://localhost/api-get")
            }
        });

        DenoAsserts.assertEquals(args[0], undefined);
        DenoAsserts.assert(args[1] instanceof ViewModel);
    }


}