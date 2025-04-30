describe('Config (singleton)', () => {
  const OLD_ENV = process.env;
  let logSpy: jest.SpyInstance;
  let errorSpy: jest.SpyInstance;
  let infoSpy: jest.SpyInstance;
  let warnSpy: jest.SpyInstance;
  let debugSpy: jest.SpyInstance;
  let traceSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV };
    // Mock logs
    logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    infoSpy = jest.spyOn(console, 'info').mockImplementation(() => {});
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    debugSpy = jest.spyOn(console, 'debug').mockImplementation(() => {});
    traceSpy = jest.spyOn(console, 'trace').mockImplementation(() => {});
    // Reset Config singleton for test isolation
    const Config = require('@src/config').default;
    Config.resetInstanceForTest();
  });

  afterEach(() => {
    logSpy.mockRestore();
    errorSpy.mockRestore();
    infoSpy.mockRestore();
    warnSpy.mockRestore();
    debugSpy.mockRestore();
    traceSpy.mockRestore();
    process.env = OLD_ENV;
  });

  it('should succeed with a valid configuration', () => {
    process.env.PORT = '4000';
    process.env.HOST = '127.0.0.1';
    jest.resetModules();
    const Config = require('@src/config').default;
    Config.resetInstanceForTest();
    const config = Config.getInstance();
    expect(config.port).toBe(4000);
    expect(config.host).toBe('127.0.0.1');
  });

  it('should throw if PORT is invalid', () => {
    process.env.PORT = 'notanumber';
    process.env.HOST = '127.0.0.1';
    jest.resetModules();
    const Config = require('@src/config').default;
    Config.resetInstanceForTest();
    expect(() => Config.getInstance()).toThrow('Invalid PORT value: must be a non-negative integer');
  });
});