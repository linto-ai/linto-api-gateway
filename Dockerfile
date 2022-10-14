FROM node:latest

WORKDIR /usr/src/app

COPY package.json ./

RUN npm install
COPY . .
COPY ./docker-entrypoint.sh /

EXPOSE 80
ENTRYPOINT ["/docker-entrypoint.sh"]