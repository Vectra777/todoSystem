# ---- Base image ----
FROM node:20-alpine

# ---- Create app directory ----
WORKDIR /usr/src/app

# ---- Install dependencies only ----
COPY package*.json ./
# If you use pnpm/yarn, adapt this
RUN npm ci --omit=dev

# ---- Copy source code ----
COPY . .

# ---- Environment ----
ENV NODE_ENV=production

# ---- Expose port (change if your app is different) ----
EXPOSE 3000

# ---- Start command ----
# Make sure "start" exists in your package.json scripts
CMD ["npm", "start"]
