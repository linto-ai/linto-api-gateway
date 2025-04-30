import type { IService } from "./IService";

export default class Service implements IService {
  // Core service properties
  id: string;
  name: string;
  enabled: boolean;
  description: string;
  scope: string;
  version: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  labels: Record<string, string>;
  host: string | undefined;
  endpoints: string[];
  endpointsConfig: Record<string, { middlewares: { name: string; config: Record<string, any> }[] }>;
  /**
   * Raw Docker service inspect details (for advanced host/expose logic)
   */
  details: any;

  constructor(details: any) {
    this.details = details;
    this.id = details.ID;
    this.name = details.Spec.Name;
    this.enabled = details.Spec.Mode?.Replicated?.Replicas > 0;
    this.description = details.Spec.Labels["linto.gateway.desc"] || "";
    this.scope = details.Spec.Labels["linto.gateway.scope"] || "";
    this.version = details.Version.Index;
    this.status = "created";
    this.createdAt = new Date(details.CreatedAt);
    this.updatedAt = new Date(details.UpdatedAt);
    this.labels = details.Spec.Labels || {};
    this.host = this.extractHost();
    const endpoints = this.labels["linto.gateway.endpoints"];
    this.endpoints = endpoints
      ? endpoints
          .split(",")
          .map((e: string) => e.trim())
          .filter(Boolean)
      : [];
    this.endpointsConfig = this.parseEndpointsAndMiddlewares(
      this.labels,
      this.endpoints
    );
  }

  /**
   * Compute the service host URL for proxying.
   * Priority:
   * 1. Use explicit label (linto.gateway.host/url/target) if present.
   * 2. If PublishedPort is available (Docker Swarm with published port), use localhost:PublishedPort (for local dev).
   * 3. Otherwise, build from service name (Swarm DNS) and port.
   *    - If deployed in a Docker Swarm stack, remove the namespace prefix from the service name.
   *    - Compose as http://serviceName[:port]
   */
  private extractHost(): string | undefined {
    // 1. Use explicit label if present
    if (this.labels["linto.gateway.host"]) {
      return this.labels["linto.gateway.host"];
    } else if (this.labels["linto.gateway.url"]) {
      return this.labels["linto.gateway.url"];
    } else if (this.labels["linto.gateway.target"]) {
      return this.labels["linto.gateway.target"];
    }
    // 2. Use PublishedPort if available (for local dev)
    const endpointPorts = this.details?.Endpoint?.Ports;
    if (endpointPorts && endpointPorts.length > 0) {
      const published = endpointPorts.find((p: any) => p.PublishedPort);
      if (published) {
        return `http://localhost:${published.PublishedPort}`;
      }
    }
    // 3. Build from service name (Swarm DNS) and port
    const namespace = this.labels["com.docker.stack.namespace"];
    let serviceName = this.name;
    if (namespace && serviceName.startsWith(namespace + "_")) {
      serviceName = serviceName.replace(namespace + "_", "");
    }
    let host = `http://${serviceName}`;
    if (this.labels["linto.gateway.port"]) {
      host += `:${this.labels["linto.gateway.port"]}`;
    }
    return host;
  }

  /**
   * Parse endpoints and their middlewares from Docker labels.
   * @param labels - Docker service labels
   * @param endpoints - List of endpoint paths
   * @returns Mapping of endpoint path to its middleware chain
   */
  private parseEndpointsAndMiddlewares(
    labels: Record<string, string>,
    endpoints: string[]
  ): Record<string, { middlewares: { name: string; config: Record<string, any> }[] }> {
    const result: Record<string, { middlewares: { name: string; config: Record<string, any> }[] }> = {};
    endpoints.forEach((endpoint) => {
      const endpointKey = endpoint.replace(/[-/]/g, "");
      const prefix = `linto.gateway.endpoint.${endpointKey}`;
      let middlewares: string[] = [];
      if (
        Object.prototype.hasOwnProperty.call(labels, `${prefix}.middleware`)
      ) {
        middlewares = String(labels[`${prefix}.middleware`])
          .split(",")
          .map((m) => m.trim())
          .filter(Boolean);
      }
      const middlewaresArr = middlewares.map((middlewareName) => {
        const config: Record<string, any> = {};
        Object.keys(labels).forEach((label) => {
          const match = label.match(
            new RegExp(`^${prefix}\\.middleware\\.${middlewareName}\\.(.+)$`)
          );
          if (match) {
            const configKey = match[1];
            try {
              config[configKey] = JSON.parse(labels[label]);
            } catch {
              config[configKey] = labels[label];
            }
          }
        });
        return { name: middlewareName, config };
      });
      result[endpoint] = { middlewares: middlewaresArr };
    });
    return result;
  }

  /**
   * Get the middleware config for a specific endpoint.
   * @param endpoint - The endpoint path
   * @returns Middleware chain config for the endpoint
   */
  getEndpointConfig(endpoint: string) {
    return this.endpointsConfig[endpoint];
  }
}
