import type { IModule } from '@src/core/IModule';
import type CoreGateway from '@src/core/CoreGateway';
import type { IEventBus } from './IEventBus';
import { LocalEventBus } from './LocalEventBus';

/**
 * CoreEventsModule
 * Central event bus for inter-module and inter-service communication
 */
export default class CoreEventsModule implements IModule {
  public name = 'core-events';
  public bus: IEventBus;

  constructor() {
    this.bus = new LocalEventBus();
  }

  async init() {
  }
} 