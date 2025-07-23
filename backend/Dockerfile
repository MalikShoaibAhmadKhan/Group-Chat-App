# Dockerfile for backend (NestJS)

# ---- Build Stage ----
# Use the 'slim' variant for compatibility with native modules
FROM node:20-slim as build

WORKDIR /app

# Copy root-level config files and package definitions
COPY nx.json package.json package-lock.json tsconfig.base.json ./

# Selectively copy only the necessary source code
COPY backend ./backend
COPY shared-types ./shared-types

# Install all dependencies for the build
RUN npm install --legacy-peer-deps

# Build the backend application
RUN npx nx build backend --prod

# ---- Prune Stage ----
FROM node:20-slim as prune
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev --legacy-peer-deps

# ---- Runtime Stage ----
# Use the 'slim' variant for the runtime as well for consistency
FROM node:20-slim as runtime

WORKDIR /app

# Copy package files first and set correct ownership
COPY --from=prune /app/node_modules ./node_modules
COPY --from=build /app/dist/backend ./dist

ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "/app/dist/main.js"]