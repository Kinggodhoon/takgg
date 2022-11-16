import { PoolConfig } from "pg";

export enum SupportedEnvironment {
  development = 'development',
  production = 'prod',
}

export interface Configuration {
  readonly ENV: string;
  readonly JWT_SECRET: string;
  readonly JWT_EXPIRES_IN: string;
  readonly DB_INFO: PoolConfig;
}
