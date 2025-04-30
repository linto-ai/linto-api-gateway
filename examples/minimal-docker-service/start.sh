#!/bin/sh

cd $(dirname $0)

IMAGE=minimal-docker-service
CONTAINER=minimal-docker-service
PORT=8088

# init swarm mode if not already
docker swarm init 2>/dev/null || true

# Build the image if it doesn't exist
docker image inspect $IMAGE > /dev/null 2>&1 || docker build -t $IMAGE .

# Remove the container if it exists
docker rm -f $CONTAINER 2>/dev/null || true

# Run the service
docker service create \
     --name minimal-docker-service \
     --publish 8088:80 \
     --label linto.gateway.enable=true \
     --label linto.gateway.port=80 \
     --label linto.gateway.desc='{"en": "a minimal example", "fr": "un example minimal"}' \
     --label linto.gateway.scope='cm,api,stt' \
     --label linto.gateway.endpoints='/simple-service' \
     --label linto.gateway.endpoint.simpleservice.middleware='logs' \
     --label linto.gateway.endpoint.simpleservice.middleware.logs.level='info' \
     minimal-docker-service

echo "Service lancé sur http://localhost:$PORT/" 