import Service from '../../../../src/modules/coreServices/service';

describe('Service (processus complet)', () => {
  const details = {
    ID: 'service-123',
    Spec: {
      Name: 'minimal-service',
      Mode: { Replicated: { Replicas: 1 } },
      Labels: {
        'linto.gateway.desc': '{"en": "a minimal example", "fr": "un example minimal"}',
        'linto.gateway.scope': 'cm,api,stt',
        'linto.gateway.endpoints': '/simple-service,/other',
        'linto.gateway.middleware': 'auth',
        'linto.gateway.endpoint.simpleservice.middleware': 'auth,logger',
        'linto.gateway.endpoint.simpleservice.middleware.auth.mode': 'strict',
        'linto.gateway.endpoint.simpleservice.middleware.logger.level': 'debug',
        'linto.gateway.endpoint.other.middleware': 'cors',
        'linto.gateway.endpoint.other.middleware.cors.origin': '"*"',
      }
    },
    Version: { Index: '1.0.0' },
    CreatedAt: '2024-06-01T12:00:00.000Z',
    UpdatedAt: '2024-06-01T12:10:00.000Z',
  };

  it('should instantiate a Service and expose all main properties', () => {
    const service = new Service(details);
    expect(service.id).toBe('service-123');
    expect(service.name).toBe('minimal-service');
    expect(service.enabled).toBe(true);
    expect(service.description).toBe('{"en": "a minimal example", "fr": "un example minimal"}');
    expect(service.scope).toBe('cm,api,stt');
    expect(service.version).toBe('1.0.0');
    expect(service.status).toBe('created');
    expect(service.createdAt).toEqual(new Date('2024-06-01T12:00:00.000Z'));
    expect(service.updatedAt).toEqual(new Date('2024-06-01T12:10:00.000Z'));
    expect(service.labels).toBe(details.Spec.Labels);
    expect(service.endpoints).toEqual(['/simple-service', '/other']);
  });

  it('should parse endpointsConfig with middlewares and config', () => {
    const service = new Service(details);
    expect(service.endpointsConfig).toEqual({
      '/simple-service': {
        middlewares: [
          { name: 'auth', config: { mode: 'strict' } },
          { name: 'logger', config: { level: 'debug' } }
        ]
      },
      '/other': {
        middlewares: [
          { name: 'cors', config: { origin: '*' } }
        ]
      }
    });
  });

  it('should handle missing endpoints label gracefully', () => {
    const detailsNoEndpoints = JSON.parse(JSON.stringify(details));
    delete detailsNoEndpoints.Spec.Labels['linto.gateway.endpoints'];
    const service = new Service(detailsNoEndpoints);
    expect(service.endpoints).toEqual([]);
    expect(service.endpointsConfig).toEqual({});
  });

  it('should handle empty middlewares and config', () => {
    const detailsEmpty = JSON.parse(JSON.stringify(details));
    detailsEmpty.Spec.Labels['linto.gateway.endpoints'] = '/empty';
    const service = new Service(detailsEmpty);
    expect(service.endpointsConfig).toEqual({
      '/empty': { middlewares: [] }
    });
  });
}); 