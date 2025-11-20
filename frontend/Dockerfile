# ---- Build stage ----
FROM node:20-alpine AS build

WORKDIR /usr/src/app

# Install deps
COPY package*.json ./
RUN npm ci

# Copy source
COPY . .

# Build with Vite (npm script usually "build": "vite build")
RUN npm run build

# ---- Run stage ----
FROM nginx:alpine

# Clean default HTML
RUN rm -rf /usr/share/nginx/html/*

# Copy Vite build output (dist/)
COPY --from=build /usr/src/app/dist /usr/share/nginx/html

# (Optional) history mode for Vue Router
# COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
