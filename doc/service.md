# Service in LinTO API Gateway

## Overview

A "service" in the LinTO API Gateway is a dockerized application (typically HTTP/REST) that is automatically discovered, proxied, and managed by the api gateway. Services are described and configured via Docker labels, which allow dynamic routing, middleware injection, and health monitoring (`linto.gateway.*` labels).

---

## Minimal requirements

- The service **must expose an HTTP endpoint** (e.g. with Express, Hapi, FastAPI, Flask, etc.).
- The service **must declare required labels** for the gateway to discover and proxy it.

### Example labels docker

```
linto.gateway.enable=true
linto.gateway.port=80
linto.gateway.endpoints=/simple-service
linto.gateway.desc={"en": "a minimal example", "fr": "un example minimal"}
linto.gateway.scope=cm,api,stt
```

> [See /examples/minimal-docker-service](../examples/minimal-docker-service/README.md)

---

## Endpoints declaration

- `linto.gateway.endpoints` must list all HTTP paths to be proxied (comma-separated).
- Each endpoint can have its own middleware chain and configuration.

**Example:**
```
linto.gateway.endpoints=/simple-service,/other
```

---

## Healthcheck

- The gateway will periodically check the health of your service.
- By default, it will try GET requests on `/health`, `/healthcheck`, and `/`.
- You can override the path with:
  - `linto.gateway.healthcheck=/custom-health`
- The endpoint must return `HTTP 200` if healthy.

---

## Middlewares

- You can declare a chain of middlewares for each endpoint:
```
linto.gateway.endpoint.simpleservice.middleware=logs,cors
linto.gateway.endpoint.simpleservice.middleware.logs.level=info
linto.gateway.endpoint.simpleservice.middleware.cors.origin=*
```
- See [doc/middleware.md](./middleware.md) for available middlewares and how to add your own.

---

## Best practices

- Always return HTTP 200 on your healthcheck endpoint when the service is ready.
- Use meaningful descriptions in `linto.gateway.desc` (can be JSON for i18n).
- Use unique endpoint paths to avoid route conflicts.
- Document any custom middleware you require.
- Test your service locally with the gateway using published ports and the provided scripts.

---

## Full label reference

| Label                                 | Description                                      | Required |
|---------------------------------------|--------------------------------------------------|----------|
| linto.gateway.enable                  | Enable discovery for this service                | Yes      |
| linto.gateway.port                    | Internal HTTP port of the service                | Yes      |
| linto.gateway.endpoints               | Comma-separated list of HTTP paths to proxy      | Yes      |
| linto.gateway.desc                    | Description (string or JSON)                     | Yes      |
| linto.gateway.scope                   | Comma-separated list of scopes                   | No       |
| linto.gateway.healthcheck             | Custom healthcheck path (default: /health, etc.) | No       |
| linto.gateway.endpoint.{name}.middleware | Middleware chain for endpoint                | No       |
| linto.gateway.endpoint.{name}.middleware.{mw}.{option} | Middleware config for endpoint         | No       |

---

## Troubleshooting

- If your service is not proxied, check that all required labels are present and correct.
- If your service is removed, check the healthcheck endpoint and logs for errors.
- Use the gateway logs to debug middleware and proxy issues.
