# Api Gateway

The api-gateway is a service designed to manage and route API requests to various backend services. It acts as an intermediary, handling incoming requests and forwarding them to the appropriate service based on defined rules and configurations.

- Dynamic Service Registration: Automatically listens to Docker events to register services and their associated routing rules based on predefined labels.
- Endpoint Management: Allows services to expose specific endpoints and configure middleware for functionalities like logging, authentication, and billing.
- Flexible API Integration: Provides a RESTful API for adding new service proxies, allowing for easy integration of additional services with just a JSON payload.
- Scoped Routing: Supports scoping to manage and segregate service visibility and access, facilitating better organization and control over service interactions.

## Swagger

Defaut swagger url can be reach at : http://localhost/api-docs

## Registry Service by API

### 1. **Overview**

We provides an API for manually adding service proxies.

### 3. **API Details**

#### **Endpoint**

- **POST**: `http://<HOST>/gateway/services?type=transcription`

**Supported Types**: transcription, nlp, tts, services

#### **Payload Format**

The JSON payload should include detailed information about the service:

```json
{
  "label": {
    "enabled": true,
    "endpoints": {
      "/stt-api": {
        "middlewares": ["logs", "auths"],
        "middlewareConfig": {
          "auths": {
            "paramAuth1": "valueAuth1"
          },
          "logs": {
            "paramLog1": "valueLog1"
          }
        }
      }
    },
    "port": 5050,
    "desc": {
      "en": "english",
      "fr": "french"
    }
  },
  "name": "service",
  "serviceName": "service",
  "host": "https://<SERVICE_HOST_TO_REGISTER>/api/",
  "healthcheck": "https://<SERVICE_HOST_TO_REGISTER>/healthcheck"
}
```

### 4. **Field Descriptions**

- **label**: Contains metadata about the service.
  - **enabled**: A boolean to enable/disable the service.
  - **endpoints**: Specifies the exposed endpoints and associated middlewares.
  - **middlewareConfig**: Configuration for the applied middlewares, e.g., logs and authentication.
  - **port**: The port on which the service runs.
  - **desc**: Descriptions of the service in different languages.
- **name**: The internal name of the service.
- **serviceName**: The service's unique identifier.
- **host**: The URL for the service's main endpoint.
- **healthcheck**: A URL used to check the service's health status.

## Registry service on docker event

### 1. **Overview**

The **api-gateway** utilizes specific labels for Docker events to configure service behavior and routing. These labels allow for dynamic registration of services and their properties based on Docker configurations.

### 2. **Docker Labels for Service Configuration**

#### **Labels**

- **linto.gateway.enable**:

  - **Value**: `true`
  - **Description**: Enables the gateway for the service.

- **linto.gateway.port**:

  - **Value**: `80`
  - **Description**: The port on which the service will be exposed through the gateway.

- **linto.gateway.scope**:

  - **Value**: `cm,worker,...`
  - **Description**: Defines the scopes under which the service operates. Multiple scopes can be specified, separated by commas.

- **linto.gateway.desc**:

  - **Value**: `{"en": "Some description", "fr": "Une description"}`
  - **Description**: A JSON string providing descriptions of the service in different languages.

- **linto.gateway.endpoints**:

  - **Value**: `/my-endpoint`
  - **Description**: Specifies the endpoints exposed by the service.

- **linto.gateway.endpoint.stt-french-generic.middlewares**:

  - **Value**: `logs,stuff`
  - **Description**: Lists the middlewares to be applied to the specified endpoint.

- **linto.gateway.endpoint.stt-french-generic.middlewares.stuff.json**:

  - **Value**: `{"key1": "value1", "key2": "value2"}`
  - **Description**: A JSON string providing configuration for the billing middleware associated with the endpoint.

- **linto.gateway.endpoint.stt-french-generic.middlewares.logs.debug**:
  - **Value**: `*`
  - **Description**: Configuration for debugging in the logs middleware, where `*` indicates all levels of logging.

### 3. **Example Usage**

These labels can be applied in the Docker container configuration (e.g., in a Docker Compose file or during container creation) to set up the service with the specified configurations.

```yaml
services:
  some-image:
    image: my-image
    labels:
      linto.gateway.enable: "true"
      linto.gateway.port: "80"
      linto.gateway.scope: "cm,worker"
      linto.gateway.desc: '{"en": "My service", "fr": "Mon service"}'
      linto.gateway.endpoints: "/stt-french-generic"
      linto.gateway.endpoint.stt-french-generic.middlewares: "logs,stuff"
      linto.gateway.endpoint.stt-french-generic.middlewares.stuff.json: '{"key1": "value1", "key2": "value2"}'
      linto.gateway.endpoint.stt-french-generic.middlewares.logs.debug: "*"
```

### 4. **Notes**

- Ensure that all labels are properly formatted and contain valid values to avoid misconfiguration.
- The **api-gateway** dynamically picks up these labels when the associated Docker events occur, allowing for real-time service management.

## Listing registered service

#### **Endpoint**

- **GET**: `http://<HOST>/gateway/services?scope=cm&flat=true`

- The `scope` query parameter allows filtering services based on their scope on registration.
- The `flat` query parameter ensures that the response structure is simplified, providing only the essential information about each service.

#### **Response Format**

The response is a JSON object containing categorized services and their endpoints. Below is an example of the response structure:

```json
{
  "transcription": [],
  "nlp": [],
  "tts": [],
  "services": [
    {
      "name": "linto_saas_rest-api",
      "serviceName": "rest-api",
      "host": "http://localhost:8001",
      "healthcheck": "http://localhost:8001/healthcheck",
      "endpoints": [
        {
          "endpoint": "/private",
          "middlewares": ["logs", "auths"]
        }
      ]
    }
  ]
}
```

- **transcription**: An array that would contain services related to transcription.
- **nlp**: An array that would contain services related to natural language processing.
- **tts**: An array that would contain services related to text-to-speech.
- **services**: An array of services that match the specified scope.
