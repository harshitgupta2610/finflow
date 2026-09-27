FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json ./
COPY apps/frontend/package.json ./apps/frontend/

RUN cd apps/frontend && npm install

COPY apps/frontend ./apps/frontend

ENV NEXT_PUBLIC_API_URL=http://backend:4000/api/v1

RUN cd apps/frontend && npm run build

FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/apps/frontend/node_modules ./node_modules
COPY --from=builder /app/apps/frontend/.next ./.next
COPY --from=builder /app/apps/frontend/public ./public
COPY --from=builder /app/apps/frontend/package.json ./package.json

EXPOSE 3000

CMD ["npm", "run", "start"]
