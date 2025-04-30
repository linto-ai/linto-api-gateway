import type CoreGateway from './CoreGateway';

export interface IModule {
  name: string;
  init(core: CoreGateway): Promise<void> | void;
  shutdown?(): Promise<void> | void;
}