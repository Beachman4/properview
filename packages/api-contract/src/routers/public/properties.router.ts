import { initContract } from "@ts-rest/core";
import { commonPropertySchema } from "../../schemas";
import { z } from "zod";

const c = initContract();

export const paginatedPropertySchema = z.object({
  data: z.array(commonPropertySchema),
  meta: z.object({
    total: z.number(),
    page: z.number(),
    limit: z.number(),
    totalPages: z.number(),
    hasNext: z.boolean(),
    hasPrev: z.boolean(),
  }),
});

export const propertiesRouter = c.router({
  list: {
    method: "GET",
    path: "/properties",
    query: z.object({
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(100).default(20),
      sortBy: z.string().optional(),
      sortOrder: z.enum(["asc", "desc"]).default("desc"),
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
    },
  },
  get: {
    method: "GET",
    path: "/properties/:id",
    responses: {
      200: commonPropertySchema,
    },
  },
  view: {
    method: "GET",
    path: "/properties/:id/view",
    responses: {
      200: z.boolean(),
    },
  },
  submitInquiry: {
    method: "POST",
    path: "/inquiries",
    body: z.object({
      propertyId: z.string().uuid("Invalid property ID format"),
      name: z
        .string()
        .min(2, "Name must be at least 2 characters")
        .max(100, "Name too long"),
      email: z.string().email("Invalid email format"),
      phone: z
        .string()
        .min(10, "Phone number must be at least 10 digits")
        .max(20, "Phone number too long"),
      message: z
        .string()
        .min(10, "Message must be at least 10 characters")
        .max(1000, "Message too long"),
    }),
    responses: {
      200: z.object({
        message: z.string(),
      }),
    },
  },
});
