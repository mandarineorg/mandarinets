// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { Timers } from "../../../main-core/internals/core/timers.ts";
import { Mandarine } from "../../../main-core/Mandarine.ns.ts";

export class MandarineMVCCache {

    public static instance: MandarineMVCCache;

    private items: Map<string, Mandarine.MandarineMVC.Internal.Core.CacheItem> = new Map<string, Mandarine.MandarineMVC.Internal.Core.CacheItem>();

    public add<T = any>(key: string, object: T, expiration?: number) {
        const isCacheEnabled = Mandarine.Global.readConfigByDots("mandarine.server.cache.enabled");
        if(isCacheEnabled === true) {
            this.items.set(key, {
                key,
                object,
                expiration: new Date(Date.now() + (expiration || Mandarine.Global.readConfigByDots("mandarine.server.cache.defaultExpiration")))
            });
        }
    }

    public has(key: string) {
        return this.items.has(key);
    }

    public delete(key: string) {
        return this.items.delete(key);
    }

    public get<T = any>(key: string): T | undefined {
        return this.items.get(key)?.object;
    }

    public getAll(): Array<Mandarine.MandarineMVC.Internal.Core.CacheItem> {
        return Array.from(this.items.values());
    }

    public enableCleaningInterval() {
        Mandarine.MandarineCore.Internals.getTimersManager().add(Timers.MANDARINE_MVC_CACHE_EXPIRATION_INTERVAL,
             "Interval", 
             () => {
                const items = this.getAll();
                const dateNow = new Date(Date.now());
                items.filter((item) => dateNow >= item.expiration).map((item) => this.delete(item.key));
            }, Mandarine.Global.readConfigByDots("mandarine.server.cache.expirationInterval"));
    }

    public disableCleaningInterval() {
        Mandarine.MandarineCore.Internals.getTimersManager().delete(Timers.MANDARINE_MVC_CACHE_EXPIRATION_INTERVAL);
    }
    
    public static getInstance() {
        if(!this.instance) {
            this.instance = new MandarineMVCCache();
        }

        return this.instance;
    }


}