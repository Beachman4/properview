FROM node:22-alpine

WORKDIR /app

RUN apk add --no-cache openssl

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/api-contract ./packages/api-contract
COPY apps/api ./apps/api

RUN pnpm install --frozen-lockfile -P --ignore-scripts

RUN cd apps/api && npx -y prisma generate

CMD ["node", "apps/api/dist/src/main"]

EXPOSE 3000
