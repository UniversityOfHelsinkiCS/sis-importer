FROM registry.access.redhat.com/ubi8/nodejs-16-minimal

ENV TZ="Europe/Helsinki"

WORKDIR /opt/app-root/src

COPY package* ./
RUN npm ci -f --omit-dev
COPY . .

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

CMD ["npm", "start"]
