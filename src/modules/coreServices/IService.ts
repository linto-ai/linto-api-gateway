export interface IService {
  id: string;
  name: string;
  enabled: boolean;
  description: string;
  scope: string;
  version: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  labels: Record<string, string>;
  host: string | undefined;
  endpoints: string[];
  endpointsConfig: Record<string, { middlewares: { name: string, config: Record<string, any> }[] }>;
  getEndpointConfig(endpoint: string): { middlewares: { name: string, config: Record<string, any> }[] } | undefined;
}
