import CoreEventsModule from '@src/modules/coreEvents/CoreEventsModule';

describe('CoreEventsModule', () => {
  let coreEvents: CoreEventsModule;

  beforeEach(() => {
    coreEvents = new CoreEventsModule();
  });

  it('should emit and receive an event', (done) => {
    const payload = { foo: 'bar' };
    coreEvents.bus.on('test:event', (data) => {
      expect(data).toEqual(payload);
      done();
    });
    coreEvents.bus.emit('test:event', payload);
  });

  it('should support off (unsubscribe)', () => {
    const handler = jest.fn();
    coreEvents.bus.on('test:off', handler);
    coreEvents.bus.off('test:off', handler);
    coreEvents.bus.emit('test:off', { a: 1 });
    expect(handler).not.toHaveBeenCalled();
  });

  it('should support once (one-time listener)', () => {
    const handler = jest.fn();
    coreEvents.bus.once('test:once', handler);
    coreEvents.bus.emit('test:once', 42);
    coreEvents.bus.emit('test:once', 43);
    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith(42);
  });
});