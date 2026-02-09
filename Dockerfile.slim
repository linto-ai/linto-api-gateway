FROM node:22-slim

RUN apt-get update && apt-get install -y --no-install-recommends gosu curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app

COPY package.json ./

RUN npm install

COPY . .
COPY ./docker-entrypoint.sh /

HEALTHCHECK CMD curl -f http://localhost/gateway/healthcheck

EXPOSE 80
ENTRYPOINT ["/docker-entrypoint.sh"]
