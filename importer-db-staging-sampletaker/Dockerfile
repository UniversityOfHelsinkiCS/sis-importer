FROM node:24-alpine

WORKDIR /opt/app-root/src

COPY package*.json .npmrc ./
RUN npm ci

COPY . .

CMD ["node", "src/index.js"]
