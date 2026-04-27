FROM node:22-alpine
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder"
ENV DATABASE_URL=$DATABASE_URL
RUN npm run build
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV NODE_ENV=production
CMD npx prisma db push && npx tsx prisma/seed.ts && node_modules/.bin/next start
