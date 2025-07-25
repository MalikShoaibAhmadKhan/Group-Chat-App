# Dockerfile for frontend (Angular) - Direct Fix

# ---- Build Stage ----
FROM node:20-slim as build

WORKDIR /app

COPY nx.json package.json package-lock.json tsconfig.base.json ./
COPY frontend ./frontend
COPY shared-types ./shared-types

RUN npm install --legacy-peer-deps
RUN npx nx build frontend --prod

# ---- Production Stage ----
FROM nginx:1.26
WORKDIR /usr/share/nginx/html

COPY --from=build /app/dist/frontend/browser .
COPY ./frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]