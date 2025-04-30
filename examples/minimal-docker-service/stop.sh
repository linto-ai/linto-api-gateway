#!/bin/sh

cd $(dirname $0)

SERVICE=minimal-docker-service
CONTAINER=minimal-docker-service

docker service rm $SERVICE 2>/dev/null || true

docker rm -f $CONTAINER 2>/dev/null || true

echo "Service and container removed." 