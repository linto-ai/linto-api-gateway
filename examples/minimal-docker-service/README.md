# Minimal Docker Service Example

Ce dossier contient un exemple minimal de service NodeJS (Express) compatible avec l'API Gateway LinTO.

## Usage

- Route `/` : retourne `hello world`
- Route `/health` : retourne `200 ok`

## Usage

```
./start.sh
```

Example de commande (docker service create):
```bash
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
```