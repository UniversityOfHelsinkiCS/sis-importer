FROM registry.access.redhat.com/ubi9/nodejs-20-minimal

ENV TZ="Europe/Helsinki"

WORKDIR /opt/app-root/src


COPY package* ./
RUN npm ci -f --omit-dev
COPY . .

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

CMD ["node", "./src/index.js"]
