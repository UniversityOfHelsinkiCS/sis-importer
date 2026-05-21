FROM node:22-alpine

ENV TZ="Europe/Helsinki"

WORKDIR /opt/app-root/src


COPY package* ./
RUN curl -fsSL https://github.com/AikidoSec/safe-chain/releases/latest/download/install-safe-chain.sh | sh -s -- --ci
RUN npm i
COPY . .

ARG NODE_ENV=development
ENV NODE_ENV=${NODE_ENV}

CMD ["node_modules/.bin/nodemon", "./src/index.js"]

