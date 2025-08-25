import z from "zod";

export const commonPropertySchema = z.object({
    id: z.string(),
    title: z.string(),
    price: z.number(),
    address: z.string(),
    addressLatitude: z.number(),
    addressLongitude: z.number(),
    bedrooms: z.number(),
    bathrooms: z.number(),
    description: z.string(),
    createdAt: z.date(),
})