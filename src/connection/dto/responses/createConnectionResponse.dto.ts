export type CreateConnectionResponseDto = {
  host: string;
  port: number;
  tlsConfig: any;
  autoReconnect: any;
  connectionTimeout: number;
  userId: number;
  name: string;
  uuid: string;
  location?: string;
};
