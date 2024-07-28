FROM node:22-alpine AS base

FROM base AS ci
WORKDIR /app

# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package.json ./
COPY package-lock.json ./
RUN  npm ci

FROM base AS build
WORKDIR /app
COPY --from=ci /app/node_modules/ ./node_modules/

FROM ci AS deploy
WORKDIR /app

COPY . .
ENV PORT 8080
EXPOSE 8080

CMD [ "npm", "run", "start:server" ]