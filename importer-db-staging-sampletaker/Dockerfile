FROM node:20-alpine

WORKDIR /opt/app-root/src

COPY package*.json ./

RUN npm ci

COPY . .

CMD ["node", "src/index.js"]
