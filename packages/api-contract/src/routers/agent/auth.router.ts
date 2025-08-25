import { initContract } from '@ts-rest/core'
import { z } from 'zod'
import { authHeaders } from '.'

const c = initContract()
export const authRouter = c.router({
  login: {
    method: 'POST',
    path: '/auth/login',
    responses: {
      200: z.object({
        token: z.string(),
      }),
      401: z.object({
        message: z.string(),
      }),
    },
    body: z.object({
      email: z.string().email('Invalid email address'),
      password: z.string(),
    }),
  },
  validateToken: {
    method: 'GET',
    path: '/auth/validate',
    responses: {
      200: z.boolean(),
    },
    headers: authHeaders,
  },
})
