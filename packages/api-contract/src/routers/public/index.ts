import { initContract } from "@ts-rest/core";
import { propertiesRouter } from "./properties.router";


const c = initContract()

export const publicRouter = c.router({
    properties: propertiesRouter,
})