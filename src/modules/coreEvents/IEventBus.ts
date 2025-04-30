export interface IEventBus {
  emit(event: string, payload?: any): void;
  on(event: string, handler: (payload: any) => void): void;
  once(event: string, handler: (payload: any) => void): void;
  off(event: string, handler: (payload: any) => void): void;
}