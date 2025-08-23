import { z } from "zod";

export const configValidationSchema = z.object({
  // App
  APP_PORT: z.coerce.number().default(3000),
  APP_ENV: z.string().default("dev"),

  // Database
  DATABASE_URL: z.string(),
  DATABASE_USER: z.string().default("properview"),
  DATABASE_PASSWORD: z.string().default("properview"),
  DATABASE_DB: z.string().default("properview"),
  DATABASE_PORT: z.coerce.number().default(5435),

  // Auth
  JWT_SECRET: z.string(),

  // Mapbox
  MAPBOX_ACCESS_TOKEN: z.string(),
});

export type EnvConfig = z.infer<typeof configValidationSchema>;
