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

# Copy root and backend package files
COPY package.json package-lock.json ./
COPY backend/package.json backend/package-lock.json ./backend/

# Install root dependencies (for monorepo tools)
RUN npm ci --omit=dev --legacy-peer-deps

# Install backend dependencies
WORKDIR /app/backend
RUN npm ci --omit=dev --legacy-peer-deps

WORKDIR /app

# ---- Runtime Stage ----
# Use the 'slim' variant for the runtime as well for consistency
FROM node:20-slim as runtime

WORKDIR /app

# Copy root node_modules for monorepo runtime dependencies
COPY --from=prune /app/node_modules ./node_modules
# Copy backend node_modules (if you want to keep this for backend-local deps)
COPY --from=prune /app/backend/node_modules ./backend/node_modules
COPY --from=build /app/dist/backend ./dist

ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "/app/dist/main.js"]