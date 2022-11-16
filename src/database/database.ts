import { Pool, PoolClient } from "pg";
import Config from "../config/Config";

export class Database {
  private pool: Pool;

  private constructor() {
    const databaseConnectionConfig = Config.getConfig().DB_INFO;

    this.pool = new Pool(databaseConnectionConfig);
  }

  public async getClient(): Promise<PoolClient> {
    const client = this.pool.connect()

    return client;
  }

  public async release(): Promise<void> {
    await this.pool.end();
  }
}