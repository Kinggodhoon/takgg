import { PoolConfig } from 'pg';

export enum SupportedEnvironment {
  development = 'dev',
}

export interface Configuration {
  readonly ENV: string;
  readonly JWT_SECRET: string;
  readonly JWT_EXPIRES_IN: string;
  readonly DB_INFO: PoolConfig;

  readonly SLACK_BOT_CONFIG: {
    BOT_TOKEN: string;
    ADMIN_USER_ID: string;
  };
}
