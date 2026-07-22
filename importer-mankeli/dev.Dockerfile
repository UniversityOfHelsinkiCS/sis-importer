FROM node:24-alpine

ENV TZ="Europe/Helsinki"

WORKDIR /opt/app-root/src


COPY package* .npmrc ./
RUN npm ci
COPY . .

ARG NODE_ENV=development
ENV NODE_ENV=${NODE_ENV}

CMD ["node_modules/.bin/nodemon", "./src/index.js"]

