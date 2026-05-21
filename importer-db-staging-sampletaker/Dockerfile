FROM node:22-alpine

WORKDIR /opt/app-root/src

COPY package*.json ./
RUN curl -fsSL https://github.com/AikidoSec/safe-chain/releases/latest/download/install-safe-chain.sh | sh -s -- --ci
RUN npm ci

COPY . .

CMD ["node", "src/index.js"]
