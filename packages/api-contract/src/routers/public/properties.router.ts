import { initContract } from "@ts-rest/core";
import { commonPropertySchema } from "src/schemas";
import { z } from "zod";


const c = initContract()



export const paginatedPropertySchema = z.object({
    data: z.array(commonPropertySchema),
    meta: z.object({
        total: z.number(),
        page: z.number(),
        limit: z.number(),
        totalPages: z.number(),
        hasNext: z.boolean(),
        hasPrev: z.boolean(),
    })
})


export const propertiesRouter = c.router({
    list: {
        method: 'GET',
        path: '/properties',
        query: z.object({
            page: z.number().min(1).default(1),
            limit: z.number().min(1).max(100).default(20),
            sortBy: z.string().optional(),
            sortOrder: z.enum(['asc', 'desc']).default('desc'),
            bedroomsMin: z.number().optional(),
            bedroomsMax: z.number().optional(),
            bathroomsMin: z.number().optional(),
            bathroomsMax: z.number().optional(),
            priceMin: z.number().optional(),
            priceMax: z.number().optional(),
            location: z.string().optional(),
        }),
        responses: {
            200: paginatedPropertySchema,
        }
    },
    get: {
        method: 'GET',
        path: '/properties/:id',
        responses: {
            200: commonPropertySchema,
        }
    },
    submitInquiry: {
        method: 'POST',
        path: '/properties/:id/inquiry',
        body: z.object({
            name: z.string(),
            email: z.email(),
            phone: z.string(),
        }),
        responses: {
            200: z.object({
                message: z.string(),
            }),
        }
    }
})