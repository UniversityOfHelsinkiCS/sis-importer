FROM node:20

ENV TZ="Europe/Helsinki"

WORKDIR /opt/app-root/src


COPY package* ./
RUN npm i
COPY . .

ARG NODE_ENV=development
ENV NODE_ENV=${NODE_ENV}

CMD ["npm", "start"]
