// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { Test, DenoAsserts, Orange } from "../../mod.ts";
import { IndependentUtils } from "../../../main-core/utils/independentUtils.ts";

export class CommonUtilsTest {

    @Test({
        name: "Test setDefaultValues",
        description: "Should set default values to properties if they do not exist"
    })
    public testSetDefaultValues() {

        const defaultObject = {
            mandarine: {
                server: {
                    port: 8080,
                    host: "127.0.0.1",
                    responseType: "text/html"
                },
                auth: {
                    type: "JSON",
                    data: {
                        requiredServer: "0.0.0.0",
                        config: {
                            param1: "Hello",
                            param2: "World",
                            param3: true,
                            param4: {
                                nested: false,
                                google: "http://google.com"
                            }
                        }
                    }
                },
                sessions: {
                    enabled: true,
                    intervalExpired: 5000
                },
                timers: true
            },
            instagram: "@andreespirela"
        };

        let test1 = IndependentUtils.setDefaultValues({
        },defaultObject);
        DenoAsserts.assertEquals(test1, defaultObject);

        let test2 = IndependentUtils.setDefaultValues({
            mandarine: {
                server: {
                    port: 6555,
                    anyOtherProp: "whatever"
                },
                auth: {
                    fakeProp: "whatever2",
                    data: {
                        requiredServer: "1.1.1.1"
                    }
                }
            }
        }, defaultObject);

        DenoAsserts.assertEquals(test2.mandarine.server, {
            ...defaultObject.mandarine.server,
            port: 6555,
            anyOtherProp: "whatever"
        });

        DenoAsserts.assertEquals(test2.mandarine.auth, {
            ...defaultObject.mandarine.auth,
            fakeProp: "whatever2",
            data: {
                ...defaultObject.mandarine.auth.data,
                requiredServer: "1.1.1.1"
            }
        });

        DenoAsserts.assertEquals(test2, {
            ...defaultObject,
            mandarine: {
                ...defaultObject.mandarine,
                server: {
                    ...defaultObject.mandarine.server,
                    port: 6555,
                    anyOtherProp: "whatever"
                },
                auth: {
                    ...defaultObject.mandarine.auth,
                    fakeProp: "whatever2",
                    data: {
                        ...defaultObject.mandarine.auth.data,
                        requiredServer: "1.1.1.1"
                    }
                }
            }
        });

        let test3 = IndependentUtils.setDefaultValues({
            mandarine: {
                auth: {
                    fakeProp: "whatever2",
                    data: {
                        config: {
                            param2: "United States",
                            param4: {
                                nested: true,
                                prop: "whatever"
                            }
                        }
                    }
                }
            }
        }, defaultObject);
        
        DenoAsserts.assertEquals(test3, {
            ...defaultObject,
            mandarine: {
                ...defaultObject.mandarine,
                auth: {
                    ...defaultObject.mandarine.auth,
                    fakeProp: "whatever2",
                    data: {
                        ...defaultObject.mandarine.auth.data,
                        config: {
                            ...defaultObject.mandarine.auth.data.config,
                            param2: "United States",
                            param4: {
                                ...defaultObject.mandarine.auth.data.config.param4,
                                nested: true,
                                prop: "whatever"
                            }
                        }
                    }
                }
            }
        });

        let test4 = IndependentUtils.setDefaultValues({
            mandarine: {
                timers: true
            }
        }, defaultObject);
        DenoAsserts.assertEquals(test4, defaultObject);


        let test5 = IndependentUtils.setDefaultValues({
            mandarine: {
                timers: false
            }
        }, defaultObject);
        DenoAsserts.assertEquals(test5, {
            ...defaultObject,
            mandarine: {
                ...defaultObject.mandarine,
                timers: false
            }
        });

        let test6 = IndependentUtils.setDefaultValues({
            instagram: "hello"
        }, defaultObject);

        DenoAsserts.assertEquals(test6, {
            ...defaultObject,
            instagram: "hello"
        })
    }

}