import ModuleRegistry from '../../../src/core/ModuleRegistry';
import type { IModule } from '../../../src/core/IModule';
import CoreGateway from '../../../src/core/CoreGateway';

describe('ModuleRegistry', () => {
  let core: CoreGateway;
  let registry: ModuleRegistry;

  beforeEach(() => {
    core = new CoreGateway();
    registry = new ModuleRegistry(core);
  });

  it('should register and get a module', () => {
    const mod: IModule = { name: 'test', init: jest.fn() };
    registry.register(mod);
    expect(registry.get('test')).toBe(mod);
  });

  it('should throw on double registration', () => {
    const mod: IModule = { name: 'test', init: jest.fn() };
    registry.register(mod);
    expect(() => registry.register(mod)).toThrow(/already registered/);
  });

  it('should return undefined for unknown module', () => {
    expect(registry.get('unknown')).toBeUndefined();
  });

  it('should call initAll on all modules', async () => {
    const mod1: IModule = { name: 'mod1', init: jest.fn() };
    const mod2: IModule = { name: 'mod2', init: jest.fn() };
    registry.register(mod1);
    registry.register(mod2);
    await registry.initAll();
    expect(mod1.init).toHaveBeenCalledWith(core);
    expect(mod2.init).toHaveBeenCalledWith(core);
  });

  it('should call shutdownAll on all modules with shutdown', async () => {
    const shutdown1 = jest.fn();
    const shutdown2 = jest.fn();
    const mod1: IModule = { name: 'mod1', init: jest.fn(), shutdown: shutdown1 };
    const mod2: IModule = { name: 'mod2', init: jest.fn(), shutdown: shutdown2 };
    const mod3: IModule = { name: 'mod3', init: jest.fn() }; // no shutdown
    registry.register(mod1);
    registry.register(mod2);
    registry.register(mod3);
    await registry.shutdownAll();
    expect(shutdown1).toHaveBeenCalled();
    expect(shutdown2).toHaveBeenCalled();
  });
}); 