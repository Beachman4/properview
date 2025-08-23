import { initContract } from '@ts-rest/core'
import { z } from 'zod'
import { authRouter, indexRouter, tripsRouter } from './routers'
import { usersRouter } from './routers/users.router'
const c = initContract()

export const contract = c.router(
  {
    auth: authRouter,
    index: indexRouter,
    trips: tripsRouter,
    users: usersRouter,
  },
  {
    commonResponses: {
      404: z.object({
        message: z.literal('Not found'),
      }),
    },
  },
)

// Export types from sub-routers
export * from './routers/trips.router'
export * from './notifications'