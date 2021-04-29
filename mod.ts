// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

export { ApplicationContext } from "./main-core/application-context/mandarineApplicationContext.ts";

export { Mandarine } from "./main-core/Mandarine.ns.ts";
export { DI } from "./main-core/dependency-injection/di.ns.ts";
export { MandarineSecurity } from "./security-core/mandarine-security.ns.ts";

export { Log } from "./logger/log.ts";
export { ComponentsRegistry } from "./main-core/components-registry/componentRegistry.ts";
export { Value } from "./main-core/decorators/configuration-readers/value.ts";
export { Component } from "./main-core/decorators/stereotypes/component/component.ts";
export { Configuration } from "./main-core/decorators/stereotypes/configuration/configuration.ts";
export { Service } from "./main-core/decorators/stereotypes/service/service.ts";
export { Middleware } from "./main-core/decorators/stereotypes/middleware/Middleware.ts";
export type { MiddlewareTarget, NonComponentMiddlewareTarget } from "./main-core/internals/interfaces/middlewareTarget.ts";
export { Inject } from "./main-core/dependency-injection/decorators/Inject.ts";
export { Injectable } from "./main-core/dependency-injection/decorators/injectable.ts";
export { MandarineCore } from "./main-core/mandarineCore.ts";
export { Controller } from "./mvc-framework/core/decorators/stereotypes/controller/controller.ts";
export { Param, RouteParam, QueryParam, RequestParam, Session, ResponseParam, CookieParam, Model, RequestBody, Parameters, AuthPrincipal } from "./mvc-framework/core/decorators/stereotypes/controller/parameterDecorator.ts";
export { ResponseStatus } from "./mvc-framework/core/decorators/stereotypes/controller/responseStatus.ts";
export { GET, POST, DELETE, PATCH, PUT, HEAD, OPTIONS } from "./mvc-framework/core/decorators/stereotypes/controller/routingDecorator.ts";
export { Catch } from "./main-core/decorators/stereotypes/catch/catch.ts";
export { Guard } from "./main-core/decorators/stereotypes/guards/guard.ts";
export { Override } from "./main-core/decorators/native-components/override.ts";
export { Cors } from "./mvc-framework/core/decorators/stereotypes/controller/corsMiddlewareDecorator.ts";
export { Render } from "./mvc-framework/core/decorators/stereotypes/view-engine/viewEngineDecorators.ts";
export { Pipe } from "./mvc-framework/core/decorators/stereotypes/controller/pipeDecorator.ts";
export { ConfigurationProperties } from "./main-core/decorators/configuration-readers/configurationProperties.ts";
export { ViewModel } from "./mvc-framework/core/modules/view-engine/viewModel.ts";
export { MandarineMVC } from "./mvc-framework/mandarineMVC.ts"

export { MandarineRepository } from "./orm-core/repository/mandarineRepository.ts";
export { CustomQuery, Repository } from "./orm-core/core/decorators/Repository.ts";
export { Table , Column, Id, GeneratedValue } from "./orm-core/core/decorators/entityDecorators.ts";
export { Types as SQLTypes } from "./orm-core/sql/types.ts";

export { ResourceHandler } from "./mvc-framework/core/internal/components/resource-handler-registry/resourceHandler.ts";
export { MandarineResourceResolver } from "./main-core/mandarine-native/mvc/mandarineResourceResolver.ts";

export { Optional } from "./plugins/optional.ts";
export { PromiseRepeater } from "./plugins/promiseRepeater.ts";

export { MandarineSessionHandler } from "./main-core/mandarine-native/sessions/mandarineDefaultSessionStore.ts";

export { AllowOnly } from "./security-core/core/decorators/allowOnly.ts";
export { UseMiddleware } from "./mvc-framework/core/decorators/stereotypes/controller/useMiddleware.ts";

export type { ExceptionContext, ExceptionFilter } from "./main-core/internals/interfaces/exceptionFilter.ts";
export type { GuardTarget, GuardTargetMethod } from "./main-core/internals/interfaces/guardTarget.ts";

export { UseGuards } from "./mvc-framework/core/decorators/stereotypes/controller/useGuards.ts";

export { parameterDecoratorFactory } from "./mvc-framework/core/decorators/custom-decorators/decoratorsFactory.ts";

export { Authenticator } from "./main-core/mandarine-native/security/authenticatorDefault.ts";

export { Microservice, MSOnOpen, MSOnClose, MSOnError, MSOnMessage, MSClose } from "./main-core/decorators/microservices/microservice.ts";
export { MicroserviceUserManager } from "./main-core/mandarine-native/microservices/microserviceUserManager.ts";

export { Scheduled, Timer } from "./main-core/decorators/tasks/taskScheduler.ts";

export { WebSocketClient, WebSocketServer, WSOnOpen, WSOnClose, WSOnError, WSOnMessage, WSSend, WSClose } from "./main-core/decorators/websockets/webSocket.ts"

export { MongoDBService } from "./orm-core/nosql/mongoDbService.ts";

export { EventListener } from "./main-core/decorators/stereotypes/events/dom/eventListener.ts"
/*
OpenAPI
*/
export { ApiOperation, ApiParameter, ApiResponse, ApiExternalDoc, ApiTag, ApiServer, OpenAPIBuilder } from "./mvc-framework/openapi/openApiMod.ts";