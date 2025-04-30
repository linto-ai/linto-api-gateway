import express, { Express, Request, Response, NextFunction } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import type { IModule } from "@src/core/IModule";
import type CoreGateway from "@src/core/CoreGateway";
import { getCore } from "@src/core/CoreGateway";
import Config from "@src/config";
import type { IService } from "../coreServices/IService";

/**
 * ExpressModule
 * This module encapsulates the Express server and exposes its instance to other modules.
 * It dynamically creates proxy routes for Docker services endpoints, based on service registration events.
 * Uses http-proxy-middleware for HTTP proxying.
 *
 * - Listens to 'service.registered' and 'service.removed' events to add/remove proxy routes.
 * - Each endpoint can have its own middleware chain and is proxied to the target Docker service.
 * - The Express app instance is accessible via getCore().app (see CoreGateway.ts).
 */
export default class ExpressModule implements IModule {
  public name = "express";
  public app: Express;
  public server?: ReturnType<Express["listen"]>;
  private port: number = 0;
  private host: string = "";

  // Stores references to dynamically created proxy routes for each endpoint.
  // Key: endpoint path, Value: { proxy, middlewares }
  private dynamicRoutes: Map<string, any> = new Map();

  constructor() {
    this.app = express();
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    // Expose the Express app instance globally via CoreGateway
    getCore().setApp(this.app);
  }

  /**
   * Initializes the Express server using the central configuration.
   * Also sets up listeners for service registration/removal events to manage proxy routes.
   * @param core - The CoreGateway instance
   */
  async init(core: CoreGateway) {
    const config = Config.getInstance();
    this.port = config.port;
    this.host = config.host;

    // Get the event bus from the registry
    const coreEvents = core.modules.get<any>("core-events");

    // Listen for service registration to create dynamic proxy routes
    coreEvents?.bus.on("service.registered", (service: IService) => {
      this.registerServiceEndpoints(service);
    });

    // TODO: Listen for service update to update proxy routes

    // Listen for service removal to clean up proxy routes
    coreEvents?.bus.on("service.removed", (service: IService) => {
      this.unregisterServiceEndpoints(service);
    });

    await new Promise<void>((resolve, reject) => {
      this.server = this.app.listen(this.port, this.host, (error?: any) => {
        // Emit event on server start
        coreEvents?.bus.emit("server:started", {
          port: this.port,
          host: this.host,
        });
        error ? reject(error) : resolve();
      });
    });
  }

  /**
   * Dynamically creates proxy routes for each endpoint of a registered service.
   * Uses http-proxy-middleware to forward traffic to the Docker service.
   * @param service - The registered IService instance
   */
  private registerServiceEndpoints(service: IService) {
    const app = this.app;

    if (!service.host) {
      getCore().log("warn", `No host found for service ${service.name}`);
      return;
    }
    Object.entries(service.endpointsConfig).forEach(
      ([endpointPath, endpointConfig]) => {
        // Build the middleware chain for this endpoint (customize as needed)
        this.loadMiddlewares(endpointConfig.middlewares).then((middlewares) => {
          // Create the proxy middleware
          const proxy = createProxyMiddleware({
            target: service.host,
            changeOrigin: true,
            ws: true,
            pathRewrite: (path, req) => path, // No rewrite by default
            on: {
              error: (err: Error, req: Request, res: any) => {
                getCore().log("error", `Proxy error for ${endpointPath}:`, err);
                if (
                  res &&
                  typeof res.statusCode !== "undefined" &&
                  typeof res.end === "function"
                ) {
                  res.statusCode = 502;
                  res.end("Bad Gateway");
                }
              },
            },
          });
          // Register the dynamic route in Express
          app.use(endpointPath, ...middlewares, proxy);
          this.dynamicRoutes.set(endpointPath, { proxy, middlewares });
          getCore().log(
            "info",
            `Proxy route created: ${endpointPath} -> ${service.host}`
          );
        });
      }
    );
  }

  /**
   * Removes proxy routes for a service's endpoints.
   * Note: Express does not support removing routes at runtime; this only removes references and logs the action.
   * @param service - The IService instance being removed
   */
  private unregisterServiceEndpoints(service: IService) {
    Object.keys(service.endpointsConfig).forEach((endpointPath) => {
      if (this.dynamicRoutes.has(endpointPath)) {
        getCore().log("info", `Proxy route removed: ${endpointPath}`);
        this.dynamicRoutes.delete(endpointPath);
      }
    });
  }

  /**
   * Loads the middleware chain for a given endpoint.
   * Dynamically imports each middleware from src/middlewares/{name}/index.ts.
   * If a middleware fails to load, logs the error and adds a fallback middleware that returns 500.
   * @param middlewaresConfig - Array of middleware definitions for the endpoint
   * @returns Array of Express-compatible middleware functions
   */
  private async loadMiddlewares(
    middlewaresConfig: { name: string; config: Record<string, any> }[]
  ): Promise<Array<(req: Request, res: Response, next: NextFunction) => void>> {
    const chain: Array<(req: Request, res: Response, next: NextFunction) => void> = [];
    for (const { name, config } of middlewaresConfig) {
      try {
        // Dynamic import from src/middlewares/{name}/index.ts
        const mod = await import(`@src/middlewares/${name}/index`);
        chain.push(mod.default(config));
      } catch (err) {
        getCore().log('error', `Middleware "${name}" not found or failed to load`, err);
        // Fallback middleware: returns 500
        chain.push((req, res, next) => res.status(500).send(`Middleware "${name}" error`));
      }
    }
    return chain;
  }

  /**
   * Gracefully shuts down the Express server
   */
  async shutdown() {
    if (!this.server) {
      return;
    }
    await new Promise<void>((resolve, reject) => {
      this.server!.close((err) => (err ? reject(err) : resolve()));
    });
    this.server = undefined; // Reset server reference after shutdown
  }
}
