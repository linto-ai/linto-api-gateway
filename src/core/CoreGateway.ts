import Config from "@src/config";
import ModuleRegistry from "./ModuleRegistry";
import logger from "@src/modules/coreLogger/CoreLogger";

// Singleton instance of CoreGateway
let __core: CoreGateway | undefined;

/**
 * CoreGateway
 * The main class of the application.
 * It is responsible for initializing the modules and the services.
 * It also provides a logger and the config instance.
 * 
 * Usage:
 * 
 * ```ts
 * const core = new CoreGateway();
 * core.log("info", `Application running on ${core.config.host}:${core.config.port}`);
 * ```
 */
export default class CoreGateway {
  public readonly config: Config;
  public readonly modules: ModuleRegistry;
  public app: any;

  constructor() {
    this.config = Config.getInstance();
    this.modules = new ModuleRegistry(this);
    this.log("trace", "init CoreGateway");
    __core = this;
  }

  /**
   * App instance setter
   * @param app - The app instance
   * @description This method is used to set the app instance (must be an express app)
   */
  setApp(app: any) {
    this.app = app;
  }

  /**
   * Log a message
   * @description This method is used to log a message to the console (default) or extended
   * by a LoggingModule
   * @param level - The level of the message (log, error, info, warn, debug)
   * @param messages - The messages to log (string or any object)
   */
  log(level: string, ...messages: any[]) {
    const msg = messages.map(m => (typeof m === 'string' ? m : JSON.stringify(m))).join(' ');
    switch (level) {
      case 'error':
        logger.error(msg);
        break;
      case 'warn':
        logger.warn(msg);
        break;
      case 'info':
        logger.info(msg);
        break;
      case 'debug':
        logger.debug(msg);
        break;
      case 'trace':
        logger.trace(msg);
        break;
      default:
        logger.info(msg);
    }
  }
}

export function getCore(): CoreGateway {
  if (!__core) {
    throw new Error("CoreGateway not initialized");
  }
  return __core;
}
