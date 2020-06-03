import { MandarineCore } from "https://deno.land/x/mandarinets/mod.ts";

const services = [];
const middleware = [];
const repositories = [];
const configurations = [];
const components = [];
const otherModules = [];

new MandarineCore().MVC().run();