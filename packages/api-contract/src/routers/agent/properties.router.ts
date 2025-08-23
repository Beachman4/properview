import { initContract } from "@ts-rest/core";
import { commonPropertySchema } from "src/schemas";
import { z } from "zod";

const propertySchema = commonPropertySchema.extend({
    agentId: z.string(),
    status: z.enum(['active', 'pending', 'sold']),
})

export const paginatedPropertySchema = z.object({
    data: z.array(propertySchema),
    meta: z.object({
        total: z.number(),
        page: z.number(),
        limit: z.number(),
        totalPages: z.number(),
        hasNext: z.boolean(),
        hasPrev: z.boolean(),
    })
})

const authHeaders = z.object({
    authorization: z.string(),
})


const c = initContract()

export const propertiesRouter = c.router({
    list: {
        method: 'GET',
        path: '/agent/properties',
        query: z.object({
            page: z.number().min(1).default(1),
            limit: z.number().min(1).max(100).default(20),
        }),
        headers: authHeaders,
        responses: {
            200: paginatedPropertySchema,
        }
    },
    get: {
        method: 'GET',
        path: '/agent/properties/:id',
        headers: authHeaders,
        responses: {
            200: propertySchema,
        }
    },
    create: {
        method: 'POST',
        path: '/agent/properties',
        headers: authHeaders,
        body: z.object({
            title: z.string(),
            price: z.number(),
            address: z.string(),
            bedrooms: z.number(),
            bathrooms: z.number(),
            description: z.string(),
        }),
        responses: {
            201: propertySchema,
        }
    },
    update: {
        method: 'PUT',
        path: '/agent/properties/:id',
        headers: authHeaders,
        body: z.object({
            title: z.string(),
            price: z.number(),
            address: z.string(),
            bedrooms: z.number(),
            bathrooms: z.number(),
            description: z.string(),
        }),
        responses: {
            200: propertySchema,
        }
    },
    delete: {
        method: 'DELETE',
        path: '/agent/properties/:id',
        headers: authHeaders,
        responses: {
            204: z.null(),
        }
    },
    inquiries: {
        method: 'GET',
        path: '/agent/properties/:id/inquiries',
        headers: authHeaders,
        responses: {
            200: z.array(z.object({
                id: z.string(),
                name: z.string(),
                email: z.string(),
                phone: z.string(),
                createdAt: z.date(),
            })),
        }
    }
})