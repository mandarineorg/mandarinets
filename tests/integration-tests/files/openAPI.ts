// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { MandarineCore } from "../../../main-core/mandarineCore.ts";
import { Controller } from "../../../mvc-framework/core/decorators/stereotypes/controller/controller.ts";
import { GET } from "../../../mvc-framework/core/decorators/stereotypes/controller/routingDecorator.ts";
import { ApiResponse } from "../../../mvc-framework/openapi/decorators/apiResponse.ts";
import { ApiOperation } from "../../../mvc-framework/openapi/decorators/operation.ts";
import { ApiParameter } from "../../../mvc-framework/openapi/decorators/parameter.ts";
import { RouteParam } from "../../../mvc-framework/core/decorators/stereotypes/controller/parameterDecorator.ts";
import { ApiTag } from "../../../mvc-framework/openapi/decorators/apiTag.ts";

@Controller() 
@ApiResponse({ responseCode: "NotFound", description: "The requested information was not found" })
export class MyController { 

    @GET('/:username')
    @ApiOperation({
        summary: "Get user by user name",
        responses: {
            default: {
                description: "The user",
                content: {
                    "application/json": {
                        schema: {
                            $ref: "#/components/schemas/User"
                        }
                    }
                }
            },
            400: {
                responseCode: 400,
                description: "User not found"
            }
        }
    })
    @ApiTag("Hello")
    @ApiTag(["Hello2", "Hello3"])
    @ApiTag({name: "Deno"})
    @ApiTag({name: "NodeJS", description:"Runtime"})
    @ApiTag(["JAJA", {name: "Framework", description:".NET"}])
    @ApiResponse({ description: "lol" })
    public httpHandler(@ApiParameter({ description: "The name that needs to be fetched. Use user1 for testing.", required: true }) @RouteParam() username: string) { 
        return "Welcome to MandarineTS Framework!"; 
    } 

} 

new MandarineCore().MVC().saveOpenAPI('./openapi.yml').run();
Deno.exit();