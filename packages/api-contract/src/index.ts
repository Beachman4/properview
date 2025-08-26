import { initContract } from "@ts-rest/core";
import { z } from "zod";
import { agentRouter, publicRouter } from "./routers";
const c = initContract();

export const contract = c.router(
  {
    public: publicRouter,
    agent: agentRouter,
  },
  {
    commonResponses: {
      404: z.object({
        message: z.string(),
      }),
      400: z.union([
        z.object({
          bodyResult: z.object({
            issues: z.array(
              z.object({
                code: z.string(),
                format: z.string(),
                message: z.string(),
                path: z.array(z.string()),
              }),
            ),
          }),
        }),
        z.object({
          message: z.string(),
        }),
      ]),
    },
  },
);

export { type AgentProperty } from "./routers/agent/properties.router";
