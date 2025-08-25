import { initContract } from "@ts-rest/core";
import { z } from "zod";
import { propertiesRouter } from "./properties.router";
import { authRouter } from "./auth.router";
import { inquiriesRouter } from "./inquiries.router";

export const authHeaders = z.object({
    authorization: z.string(),
})


const c = initContract()

export const agentRouter = c.router({
    properties: propertiesRouter,
    auth: authRouter,
    inquiries: inquiriesRouter,
}, {
    commonResponses: {
        401: z.object({
            message: z.string(),
        }),
        403: z.object({
            message: z.string(),
        }),
        404: z.object({
            message: z.string(),
        }),
    }
})