# syntax=docker/dockerfile:1

FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

COPY Frontend/package*.json ./
RUN npm ci

COPY Frontend/ ./
RUN npm run build

FROM node:20-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production \
    PORT=3000

COPY Backend/package*.json ./Backend/
RUN npm --prefix ./Backend ci --omit=dev

COPY Backend ./Backend
COPY --from=frontend-builder /app/frontend/dist/ ./Backend/public/dist/

RUN addgroup -S app && adduser -S app -G app \
    && chown -R app:app /app
USER app

EXPOSE 3000

CMD ["npm", "--prefix", "/app/Backend", "start"]
http://localhost:3000