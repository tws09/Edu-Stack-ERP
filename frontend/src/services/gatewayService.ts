import api from './api';

export interface GatewayConfig {
  _id: string;
  gateway: 'jazzcash' | 'easypaisa';
  isSandbox: boolean;
  isActive: boolean;
  updatedAt: string;
}

export interface TestResult {
  reachable: boolean;
  responseCode: string;
  responseDesc: string;
}

export const gatewayService = {
  list: (): Promise<GatewayConfig[]> =>
    api.get<{ success: boolean; data: GatewayConfig[] }>('/gateway-settings').then(r => r.data.data ?? []),

  upsert: (data: {
    gateway: 'jazzcash' | 'easypaisa';
    isSandbox: boolean;
    credentials: Record<string, string>;
  }): Promise<GatewayConfig> =>
    api.post<{ success: boolean; data: GatewayConfig }>('/gateway-settings', data).then(r => r.data.data!),

  remove: (gateway: 'jazzcash' | 'easypaisa'): Promise<void> =>
    api.delete(`/gateway-settings/${gateway}`).then(() => undefined),

  test: (gateway: 'jazzcash' | 'easypaisa'): Promise<TestResult> =>
    api.post<{ success: boolean; data: TestResult }>(`/gateway-settings/${gateway}/test`).then(r => r.data.data!),
};
