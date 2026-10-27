FROM node:24-alpine

ENV TZ="Europe/Helsinki"

WORKDIR /opt/app-root/src


COPY package* .npmrc ./
RUN npm ci -f --omit-dev
COPY . .

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

CMD ["node", "./src/index.js"]
