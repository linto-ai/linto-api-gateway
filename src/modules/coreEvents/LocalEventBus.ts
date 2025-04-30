import { EventEmitter } from 'events';
import type { IEventBus } from './IEventBus';

/**
 * LocalEventBus
 * Local implementation of IEventBus using Node.js EventEmitter
 * 
 * This is a simple implementation of the IEventBus interface using Node.js EventEmitter.
 * It is used to communicate between modules in the same process.
 * 
 * Usage:
 * 
 * ```ts
 * const eventBus = new LocalEventBus();
 * eventBus.on('test', (payload) => {
 *   console.log(payload);
 * });
 * ```
 */
export class LocalEventBus extends EventEmitter implements IEventBus {
  emit(event: string, payload?: any): boolean {
    return super.emit(event, payload);
  }
  on(event: string, handler: (payload: any) => void): this {
    return super.on(event, handler);
  }
  once(event: string, handler: (payload: any) => void): this {
    return super.once(event, handler);
  }
  off(event: string, handler: (payload: any) => void): this {
    return super.off(event, handler);
  }
}