#COLYSEUS BUILD
FROM node:22-alpine AS base

FROM base AS ci
WORKDIR /app

# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./
RUN  npm ci

FROM base AS build
WORKDIR /app
COPY --from=ci /app/node_modules/ ./node_modules/
COPY package.json ./
COPY server.tsconfig.json ./
COPY src/ ./src
RUN npm run build:server

FROM build AS deploy
WORKDIR /app

COPY --from=build /app/dist/ ./dist/
ENV PORT=2567
EXPOSE 2567

CMD [ "npm", "run", "start:server" ]