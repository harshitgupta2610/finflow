FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json ./
COPY apps/backend/package.json ./apps/backend/
COPY apps/backend/prisma ./apps/backend/prisma

RUN cd apps/backend && npm install

COPY apps/backend ./apps/backend

RUN cd apps/backend && npm run prisma:generate && npm run build

FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/apps/backend/node_modules ./node_modules
COPY --from=builder /app/apps/backend/dist ./dist
COPY --from=builder /app/apps/backend/package.json ./package.json
COPY --from=builder /app/apps/backend/prisma ./prisma

EXPOSE 4000

CMD ["node", "dist/main"]
