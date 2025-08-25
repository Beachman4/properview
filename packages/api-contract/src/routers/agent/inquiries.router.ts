
import { initContract } from "@ts-rest/core";
import { z } from "zod";
import { authHeaders } from ".";


const c = initContract()

export const inquiriesRouter = c.router({
    list: {
        method: 'GET',
        path: '/agent/inquiries',
        query: z.object({
            page: z.number().min(1).default(1),
            limit: z.number().min(1).max(100).default(20),
            propertyId: z.string().optional(),
        }),
        headers: authHeaders,
        responses: {
            200: z.object({
                data: z.array(z.object({
                    id: z.string(),
                    name: z.string(),
                    email: z.string(),
                    phone: z.string(),
                    propertyId: z.string(),
                    property: z.object({
                        id: z.string(),
                        title: z.string()
                    }),
                    message: z.string(),
                    createdAt: z.date(),
                })),
                meta: z.object({
                    total: z.number(),
                    page: z.number(),
                    limit: z.number(),
                    totalPages: z.number(),
                    hasNext: z.boolean(),
                    hasPrev: z.boolean(),
                })
            })
        }
    }
})