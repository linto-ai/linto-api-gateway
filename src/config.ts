import dotenv from 'dotenv';

/**
 * Config
 * This class is a singleton that provides the configuration for the application.
 * It uses the `dotenv` package to load the environment variables from the `.env` file.
 * 
 * Configuration values:
 * - PORT: The port on which the server will listen.
 * - HOST: The host on which the server will listen.
 * - DOCKER_SOCKET_PATH: The path to the docker socket (default: /var/run/docker.sock).
 *                       => Used by the `docker-events` module.
 * 
 * Usage:
 * 
 * ```ts
 * const config = Config.getInstance();
 * console.log(config.port);
 * ```
 * 
 * Enhancement (if needed one day) :
 * - Support for `YAML` files.
 * - Support for command line arguments.
 */
export default class Config {
  private static instance: Config | undefined;
  public readonly host: string;
  public readonly port: number;
  public readonly dockerSocketPath: string;
  public readonly logLevel: string;
  public readonly redisUrl: string;

  private constructor() {
    dotenv.config();
    const portEnv = process.env.PORT;

    if (!portEnv) {
      throw new Error('Missing required environment variable: PORT');
    }

    const port = parseInt(portEnv, 10);

    if (isNaN(port) || port < 0) {
      throw new Error('Invalid PORT value: must be a non-negative integer');
    }
    this.port = port;

    const host = process.env.HOST;
    if (!host) {
      throw new Error('Missing required environment variable: HOST');
    }
    this.host = host;

    this.dockerSocketPath = process.env.DOCKER_SOCKET_PATH || '/var/run/docker.sock';

    this.logLevel = process.env.LOG_LEVEL || 'info';
    this.redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
  }

  /**
   * Get a configuration value
   * @param key - The key of the configuration value
   * @returns The value of the configuration value or undefined if it is not set
   */
  public get(key: string): string | undefined {
    return process.env[key];
  }

  public static getInstance(): Config {
    if (!Config.instance) {
      Config.instance = new Config();
    }
    return Config.instance;
  }

  public static resetInstanceForTest() {
    Config.instance = undefined;
  }
}