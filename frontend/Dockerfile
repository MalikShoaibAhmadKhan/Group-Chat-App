# ----- build -----
    FROM node:20-slim AS build
    WORKDIR /app
    COPY package*.json nx.json tsconfig.base.json  ./
    COPY frontend ./frontend
    COPY shared-types ./shared-types
    RUN npm ci --legacy-peer-deps
    RUN npx nx run frontend:build:production   # modern Nx syntax
    
    # ----- runtime -----
    FROM nginx:1.26
    COPY --from=build /app/dist/apps/frontend/browser /usr/share/nginx/html
    # Optional: custom SPA rules
    COPY ./frontend/nginx.conf /etc/nginx/conf.d/default.conf
    EXPOSE 80
    CMD ["nginx","-g","daemon off;"]
    