import CoreGateway, { getCore } from '../../../src/core/CoreGateway';
import logger from '../../../src/modules/coreLogger/CoreLogger';

describe('CoreGateway', () => {
  let errorSpy: jest.SpyInstance;
  let warnSpy: jest.SpyInstance;
  let infoSpy: jest.SpyInstance;
  let debugSpy: jest.SpyInstance;

  beforeAll(() => {
    errorSpy = jest.spyOn(logger, 'error').mockImplementation(() => {});
    warnSpy = jest.spyOn(logger, 'warn').mockImplementation(() => {});
    infoSpy = jest.spyOn(logger, 'info').mockImplementation(() => {});
    debugSpy = jest.spyOn(logger, 'debug').mockImplementation(() => {});
  });

  afterAll(() => {
    errorSpy.mockRestore();
    warnSpy.mockRestore();
    infoSpy.mockRestore();
    debugSpy.mockRestore();
  });

  it('should initialize with config and modules', () => {
    const core = new CoreGateway();
    expect(core.config).toBeDefined();
    expect(core.modules).toBeDefined();
  });

  it('should log messages at different levels', () => {
    const core = new CoreGateway();
    core.log('log', 'test log');
    expect(infoSpy).toHaveBeenCalledWith('test log');
  });

  it('should log info, warn, error, debug', () => {
    const core = new CoreGateway();
    core.log('info', 'info msg');
    core.log('warn', 'warn msg');
    core.log('error', 'error msg');
    core.log('debug', 'debug msg');
    expect(infoSpy).toHaveBeenCalledWith('info msg');
    expect(warnSpy).toHaveBeenCalledWith('warn msg');
    expect(errorSpy).toHaveBeenCalledWith('error msg');
    expect(debugSpy).toHaveBeenCalledWith('debug msg');
  });

  it('should provide singleton via getCore', () => {
    const core = new CoreGateway();
    expect(getCore()).toBe(core);
  });

  it('should throw if getCore called before initialization', () => {
    jest.resetModules();
    const { getCore } = require('../../../src/core/CoreGateway');
    expect(() => getCore()).toThrow(/not initialized/);
  });
}); 