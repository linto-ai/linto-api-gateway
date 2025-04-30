import type CoreGateway from '@src/core/CoreGateway';
import type { IModule } from '@src/core/IModule';
import type { IService } from './IService';
import type CoreEventsModule from '../coreEvents/CoreEventsModule';
import type DockerEventsModule from '../dockerEvents/DockerEventsModule';
import Service from './service';
import { request } from 'undici';

export default class CoreServicesModule implements IModule {
    public name = 'core-services';

    private services: Map<string, IService> = new Map();
    private core: CoreGateway | undefined;
    private healthcheckInterval: NodeJS.Timeout | undefined;
    private readonly maxRetries = 2; // Number of failed healthchecks before removal
    private readonly healthcheckTimeout = 3000; // ms
    private unhealthyCount: Map<string, number> = new Map();

    constructor() {
        this.services = new Map();
    }

    /**
     * Initialize the module
     * @param core - The core gateway instance
     */
    async init(core: CoreGateway) {
        this.core = core;

        this.core.modules.get<CoreEventsModule>('core-events')?.bus?.on('docker.event.create', async (event: any) => {
            this.core?.log('info', `Received docker event:create`, event);

            const dockerEventsModule = this.core?.modules.get<DockerEventsModule>('docker-events');
            if (!dockerEventsModule) {
                this.core?.log('error', 'DockerEventsModule not found');
                return;
            }

            // inspect the service
            const details = await dockerEventsModule.getDockerServiceDetails(event.Actor.ID);
            this.core?.log('info', `Fetched service details`, details);
            this.register(details);
        });

        // Healthcheck interval
        const interval = parseInt(process.env.SERVICES_HEALTHCHECK_INTERVAL || '300', 10) * 1000;

        this.healthcheckInterval = setInterval(() => this.runHealthchecks(), interval);
    }

    /**
     * Register a service
     * @param service - The service to register if enabled
     * @returns true if the service is enabled, false otherwise
     */
    register(serviceDetails: any): boolean {
        const service = new Service(serviceDetails);

        if (service.enabled) {
            this.core?.log('info', service.id, 'has been created (is enabled)');
            this.services.set(service.id, service);
            this.unhealthyCount.set(service.id, 0);
            // dispatch event for the service
            this.core?.modules.get<CoreEventsModule>('core-events')?.bus?.emit('service.registered', service);
            return true;
        }
        return false;
    }

    /**
     * Periodically checks the health of all enabled services.
     * If a service fails healthcheck maxRetries times, it is removed.
     */
    private async runHealthchecks() {
        for (const service of this.services.values()) {
            if (!service.enabled) continue;
            this.core?.log('info', `Checking health of service ${service.name} (${service.id})`);
            const healthy = await this.checkServiceHealth(service);

            if (healthy) {
                this.core?.log('info', `Service ${service.name} (${service.id}) is healthy: ${healthy}`);
                this.unhealthyCount.set(service.id, 0);
            } else {
                this.core?.log('warn', `Service ${service.name} (${service.id}) is unhealthy: ${healthy}`);
                const count = (this.unhealthyCount.get(service.id) || 0) + 1;
                this.unhealthyCount.set(service.id, count);
                if (count >= this.maxRetries) {
                    this.services.delete(service.id);
                    this.unhealthyCount.delete(service.id);
                    this.core?.modules.get<CoreEventsModule>('core-events')?.bus?.emit('service.removed', service);
                    this.core?.log('warn', `Service ${service.name} (${service.id}) is unhealthy and has been removed`);
                } else {
                    this.core?.log('warn', `Service ${service.name} (${service.id}) failed healthcheck (${count}/${this.maxRetries})`);
                }
            }
        }
    }

    /**
     * Checks the health of a service by trying /health, /healthcheck, or / (in order).
     * @returns true if the service is healthy, false otherwise
     */
    private async checkServiceHealth(service: IService): Promise<boolean> {
        const paths = [
            service.labels['linto.gateway.healthcheck'],
            '/health',
            '/healthcheck',
            '/'
        ].filter(Boolean);
        for (const path of paths) {
            try {
                const url = service.host + path;
                const { statusCode } = await request(url, { method: 'GET', headers: { 'accept': 'application/json' }, bodyTimeout: this.healthcheckTimeout });
                if (statusCode === 200) return true;
            } catch (e) {
                // ignore, try next path
            }
        }
        return false;
    }
}