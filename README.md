# LinTO API Gateway

> HYPERNEXT IS NOT READY AT ALL !

## Architecture Overview

The LinTO API Gateway is a modular, scalable, and extensible orchestration service designed to route API requests to backend microservices (e.g., async transcription, LLM summarization, more to come.) : the system is built with TypeScript and leverages a modular architecture to support cross-cutting concerns (logging, billing, monitoring, etc.) and dynamic service discovery (Docker or internal API).

### Core Principles

- **Modularity**: All cross-cutting features and business logic are implemented as modules, each conforming to a standard interface (`IModule`).
- **Event-Driven**: Inter-module and inter-service communication is handled via a central event bus (`core-events`) supporting both local and (future) distributed/brokered event propagation (todo).
- **Extensibility**: The system is designed to allow new modules or middlewares to be added, replaced, or removed with minimal impact on the core or other modules.
- **Scalability**: The gateway is cluster-ready and can be deployed behind a load balancer. The event bus is designed to be pluggable for distributed scenarios.

---

## Installation

```bash
npm install
```

### Configuration

| attribute | default value | description |
| --- | --- | --- |
| HOST | - | The HTTP server reliable host |
| PORT | - | The HTTP server listening port |

## Technical Specifications

> See documentation (in progress)

## Development and Testing

> See documentation/developer (todo)

```
npm run dev
```

**Practices:**

- Vars / Functions are `camelCase` named and **well named**.
- Focus on : performance, readability.
- Testing : we have to cover near everything (using jest).
- Please run `npm run test` before any pull request.

## Extend the System !

- To add a new feature (e.g., logging, monitoring, service discovery) : implement a module conforming to `IModule` and register it in the core.
- For distributed event propagation, implement a new event bus (e.g., `BrokerEventBus`) conforming to `IEventBus` and inject it into `CoreEventsModule`.
- All modules should communicate via the event bus and avoid direct dependencies on each other.

### Testing

```
npm run test
```

- Each module has its own unit tests under `tests/unit/modules/<moduleName>/`.
- The system is designed for high testability (jest powered) and coverage.
