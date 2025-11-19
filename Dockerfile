FROM node:22-bullseye AS builder

WORKDIR /app
COPY package.json ./
RUN npm install

COPY src ./src
COPY angular.json ./
COPY ionic.config.json ./
COPY tsconfig.app.json ./
COPY tsconfig.json ./

RUN npm run build

FROM nginx:stable-bullseye
COPY --from=builder /app/www /usr/share/nginx/html
CMD [ "nginx", "-g", "daemon off;"]
