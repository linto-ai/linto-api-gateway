import Redis from 'ioredis';
import type CoreGateway from '../../core/CoreGateway';
import type { IModule } from '../../core/IModule';
import { getCore } from '../../core/CoreGateway';

export interface ServiceState {
  id: string; // Unique service identifier (e.g. containerId)
  endpoints: string[];
  status: 'active' | 'inactive' | 'unhealthy';
  labels: Record<string, string>;
  updatedAt: number; // Timestamp (ms)
}

// Example usage
// const db = new CoreDatabase('redis://localhost:6379');
// await db.setService({ id: 'abc', endpoints: ['/foo'], status: 'active', labels: {}, updatedAt: Date.now() });
// const all = await db.getAllServices();
// console.log(all); 
export default class CoreServicesDatabase implements IModule {
  public name = 'core-services-database';
  private core!: CoreGateway;
  private redis!: Redis;
  private readonly servicesSetKey = 'services:active';
  private readonly redisUrl: string;

  constructor(redisUrl: string) {
    this.redisUrl = redisUrl;
  }

  async init(core: CoreGateway): Promise<void> {
    this.core = core;
    this.redis = new Redis(this.redisUrl);

    this.redis.on('connect', () => {
      this.core?.log('info', '[coreServicesDatabase] redis connected');
    });

    this.redis.on('error', (err) => {
      // Log connection errors
      this.core?.log('error', '[coreServicesDatabase] redis error:', err);
    });

    const coreEvents = core.modules.get<any>("core-events");

    coreEvents?.bus.on('service.registered', (service: ServiceState) => {
      this.core?.log('info', '[coreServicesDatabase] service.registered', service);
      this.setService(service);
    });

    coreEvents?.bus.on('service.updated', (service: ServiceState) => {
      this.core?.log('info', '[coreServicesDatabase] service.updated', service);
      this.setService(service);
    });

    coreEvents?.bus.on('service.removed', (service: ServiceState) => {
      this.core?.log('info', '[coreServicesDatabase] service.removed', service);
      this.removeService(service.id);
    });
  }

  async shutdown(): Promise<void> {
    await this.redis?.quit();
    this.core?.log('info', '[coreServicesDatabase] redis connection closed');
  }

  // Add or update a service
  async setService(service: ServiceState): Promise<void> {
    await this.redis.sadd(this.servicesSetKey, service.id);
    await this.redis.hmset(`service:${service.id}`, {
      ...service,
      endpoints: JSON.stringify(service.endpoints),
      labels: JSON.stringify(service.labels),
      updatedAt: service.updatedAt.toString(),
    });
  }

  // Remove a service
  async removeService(serviceId: string): Promise<void> {
    await this.redis.srem(this.servicesSetKey, serviceId);
    await this.redis.del(`service:${serviceId}`);
  }

  // Get a service by id
  async getService(serviceId: string): Promise<ServiceState | null> {
    const data = await this.redis.hgetall(`service:${serviceId}`);
    if (!data || !data.id) return null;
    return {
      id: data.id,
      endpoints: JSON.parse(data.endpoints || '[]'),
      status: (data.status as ServiceState['status']) || 'inactive',
      labels: JSON.parse(data.labels || '{}'),
      updatedAt: Number(data.updatedAt || Date.now()),
    };
  }

  // List all active services
  async getAllServices(): Promise<ServiceState[]> {
    const ids = await this.redis.smembers(this.servicesSetKey);
    const services = await Promise.all(ids.map(id => this.getService(id)));
    return services.filter(Boolean) as ServiceState[];
  }
} 