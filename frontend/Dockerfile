# ---- Build stage ----
FROM node:20-alpine AS build

WORKDIR /usr/src/app

# Install deps
COPY package*.json ./
RUN npm ci

# Copy source
COPY . .

# Build-time API URL (used by Vite) – include /api prefix
ARG VITE_API_URL=http://localhost:3000/api
ENV VITE_API_URL=${VITE_API_URL}

# Build with Vite (npm script usually "build": "vite build")
RUN npm run build

# ---- Run stage ----
FROM nginx:alpine

# Clean default HTML
RUN rm -rf /usr/share/nginx/html/*

# Copy Vite build output (dist/)
COPY --from=build /usr/src/app/dist /usr/share/nginx/html

# History mode for Vue Router (fallback to index.html)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
