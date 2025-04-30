import type { IModule } from './IModule';
import type CoreGateway from './CoreGateway';

export default class ModuleRegistry {
  private modules: Map<string, IModule> = new Map();
  private core: CoreGateway;

  constructor(core: CoreGateway) {
    this.core = core;
  }

  /**
   * Register a module in the registry
   * @param module - The module to register
   */
  register(module: IModule) {
    if (this.modules.has(module.name)) {
      throw new Error(`Module '${module.name}' is already registered.`);
    }
    this.modules.set(module.name, module);
  }

  /**
   * Get a module by its name
   * @param name - The name of the module
   * @returns The module or undefined if it is not registered
   */
  get<T extends IModule = IModule>(name: string): T | undefined {
    return this.modules.get(name) as T | undefined;
  }

  /**
   * Initialize all modules
   */
  async initAll() {
    this.core.log("trace", "init all modules:");
    for (const module of this.modules.values()) {
      this.core.log("trace", `=> init ${module.name}`);
      await module.init(this.core);
      this.core.log("trace", `=> ${module.name} done`);
    }
    this.core.log("trace", "all modules initialized");
  }

  /**
   * Shutdown all modules
   */
  async shutdownAll() {
    for (const module of this.modules.values()) {
      if (module.shutdown) {
        await module.shutdown();
      }
    }
  }
} 