import request from 'supertest';
import EventEmitter from 'events';
import { createProxyMiddleware } from 'http-proxy-middleware';

jest.mock('http-proxy-middleware', () => ({
  createProxyMiddleware: jest.fn(() => (req: any, res: any, next: any) => next()),
}));

describe('ExpressModule', () => {
  let expressModule: any;
  let core: any;
  let oldEnv: NodeJS.ProcessEnv;
  let logSpy: jest.SpyInstance;
  let errorSpy: jest.SpyInstance;
  let infoSpy: jest.SpyInstance;

  beforeEach(async () => {
    // Save and set environment variables for a dynamic port
    oldEnv = { ...process.env };
    process.env.PORT = '0';
    process.env.HOST = '127.0.0.1';
    jest.resetModules();
    // Mock logs
    logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    infoSpy = jest.spyOn(console, 'info').mockImplementation(() => {});
    const CoreGateway = require('@src/core/CoreGateway').default;
    const ExpressModule = require('@src/modules/express/ExpressModule').default;
    core = new CoreGateway();
    expressModule = new ExpressModule();
    // Add a test route before init, without explicit types to avoid overload issues
    expressModule.app.get('/test', function(req: any, res: any) { res.send('ok'); });
    await expressModule.init(core);
  });

  afterEach(async () => {
    logSpy.mockRestore();
    errorSpy.mockRestore();
    infoSpy.mockRestore();
    process.env = oldEnv;
    await expressModule.shutdown();
  });

  it('should expose an Express app and respond to requests', async () => {
    // Get the actual port used
    const address = expressModule.server!.address();
    const port = typeof address === 'object' && address ? address.port : process.env.PORT;
    const res = await request(`http://127.0.0.1:${port}`).get('/test');
    expect(res.status).toBe(200);
    expect(res.text).toBe('ok');
  });

  it('should shutdown the server gracefully', async () => {
    await expressModule.shutdown();
    expect(expressModule.server).toBeUndefined();
  });

  it('should be retrievable from the registry', () => {
    core.modules.register(expressModule);
    const mod = core.modules.get('express');
    expect(mod).toBe(expressModule);
  });

  it('should throw if registering the same module twice', () => {
    core.modules.register(expressModule);
    expect(() => core.modules.register(expressModule)).toThrow(/already registered/);
  });

  it('should dynamically create proxy routes on service.registered event', async () => {
    // Mock coreEvents bus
    const fakeBus = new EventEmitter();
    core.modules.register({ name: 'core-events', bus: fakeBus, init: jest.fn() });
    const ExpressModule = require('@src/modules/express/ExpressModule').default;
    const expressModule2 = new ExpressModule();
    await expressModule2.init(core);
    // Simule un service avec endpoint
    const service = {
      name: 'test-service',
      host: 'http://localhost:1234',
      endpointsConfig: {
        '/proxy': { middlewares: [] },
      },
    };
    fakeBus.emit('service.registered', service);
    await new Promise(process.nextTick); // wait for async route registration
    expect(expressModule2['dynamicRoutes'].has('/proxy')).toBe(true);
    await expressModule2.shutdown();
  });

  it('should not register a proxy route if service has no host', async () => {
    const fakeBus = new EventEmitter();
    core.modules.register({ name: 'core-events', bus: fakeBus, init: jest.fn() });
    const ExpressModule = require('@src/modules/express/ExpressModule').default;
    const expressModule2 = new ExpressModule();
    await expressModule2.init(core);
    const service = {
      name: 'nohost',
      endpointsConfig: { '/nohost': { middlewares: [] } },
    };
    fakeBus.emit('service.registered', service);
    await new Promise(process.nextTick); // wait for async route registration
    expect(expressModule2['dynamicRoutes'].has('/nohost')).toBe(false);
    await expressModule2.shutdown();
  });

  it('should remove proxy routes on service.removed event', async () => {
    const fakeBus = new EventEmitter();
    core.modules.register({ name: 'core-events', bus: fakeBus, init: jest.fn() });
    const ExpressModule = require('@src/modules/express/ExpressModule').default;
    const expressModule2 = new ExpressModule();
    await expressModule2.init(core);
    const service = {
      name: 'toremove',
      host: 'http://localhost:1234',
      endpointsConfig: { '/remove': { middlewares: [] } },
    };
    fakeBus.emit('service.registered', service);
    await new Promise(process.nextTick); // wait for async route registration
    expect(expressModule2['dynamicRoutes'].has('/remove')).toBe(true);
    fakeBus.emit('service.removed', service);
    await new Promise(process.nextTick); // wait for async route removal
    expect(expressModule2['dynamicRoutes'].has('/remove')).toBe(false);
    await expressModule2.shutdown();
  });

  it('should load middlewares successfully', async () => {
    const ExpressModule = require('@src/modules/express/ExpressModule').default;
    const expressModule2 = new ExpressModule();
    // Mock a middleware
    jest.mock('@src/middlewares/logs/index', () => ({
      __esModule: true,
      default: () => (req: any, res: any, next: any) => next(),
    }), { virtual: true });
    const chain = await expressModule2['loadMiddlewares']([
      { name: 'logs', config: {} },
    ]);
    expect(chain).toHaveLength(1);
    expect(typeof chain[0]).toBe('function');
  });

  it('should fallback if middleware fails to load', async () => {
    const ExpressModule = require('@src/modules/express/ExpressModule').default;
    const expressModule2 = new ExpressModule();
    const chain = await expressModule2['loadMiddlewares']([
      { name: 'notfound', config: {} },
    ]);
    expect(chain).toHaveLength(1);
    // Simule un appel du middleware de fallback
    const req = {} as any, res = { status: jest.fn(() => res), send: jest.fn() } as any, next = jest.fn();
    chain[0](req, res, next);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith(expect.stringContaining('notfound'));
  });

  it('should handle removal of non-existent endpoint gracefully', async () => {
    const ExpressModule = require('@src/modules/express/ExpressModule').default;
    const expressModule2 = new ExpressModule();
    // Appelle unregisterServiceEndpoints sur un endpoint jamais ajouté
    const service = { endpointsConfig: { '/ghost': { middlewares: [] } } };
    expect(() => expressModule2['unregisterServiceEndpoints'](service)).not.toThrow();
  });
});