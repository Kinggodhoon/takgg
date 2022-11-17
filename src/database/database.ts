import express from 'express';
import _ from 'lodash';
import { Client } from 'pg';

import Config from '../config/Config';

export type PrameterType =
  'BOOL' |
  'BYTEA' |
  'CHAR' |
  'INT8' |
  'INT2' |
  'INT4' |
  'REGPROC' |
  'TEXT' |
  'OID' |
  'TID' |
  'XID' |
  'CID' |
  'JSON' |
  'XML' |
  'PG_NODE_TREE' |
  'SMGR' |
  'PATH' |
  'POLYGON' |
  'CIDR' |
  'FLOAT4' |
  'FLOAT8' |
  'ABSTIME' |
  'RELTIME' |
  'TINTERVAL' |
  'CIRCLE' |
  'MACADDR8' |
  'MONEY' |
  'MACADDR' |
  'INET' |
  'ACLITEM' |
  'BPCHAR' |
  'VARCHAR' |
  'DATE' |
  'TIME' |
  'TIMESTAMP' |
  'TIMESTAMPTZ' |
  'INTERVAL' |
  'TIMETZ' |
  'BIT' |
  'VARBIT' |
  'NUMERIC' |
  'REFCURSOR' |
  'REGPROCEDURE' |
  'REGOPER' |
  'REGOPERATOR' |
  'REGCLASS' |
  'REGTYPE' |
  'UUID' |
  'TXID_SNAPSHOT' |
  'PG_LSN' |
  'PG_NDISTINCT' |
  'PG_DEPENDENCIES' |
  'TSVECTOR' |
  'TSQUERY' |
  'GTSVECTOR' |
  'REGCONFIG' |
  'REGDICTIONARY' |
  'JSONB' |
  'REGNAMESPACE' |
  'REGROLE';

export interface InputParameter {
  [key: string]: {
    value: Buffer | string | number | boolean | null,
    type: PrameterType,
  },
}

const setInputParams = (query: string, inputParams?: InputParameter): {
  query: string,
  values: Array<any>,
} => {
  let result: string = query;
  const values: Array<any> = [];

  let count = 1;
  if (inputParams) {
    Object.keys(inputParams).map((key) => {
      result = _.replace(query, `@${key}`, `$${count += 1}::${inputParams[key].type}`)
    })
  }

  return {
    query: result,
    values,
  };
}

export class Database {
  public static singleton: Database;

  static client: Client;
  static isTransaction: boolean;

  private constructor() {
    Database.client = new Client(Config.getConfig().DB_INFO);
    Database.isTransaction = false;
  }

  static async initDatabase(): Promise<void> {
    if (!this.singleton) {
      this.singleton = new Database();
    }
    await Database.client.connect();
  }

  static async release(): Promise<void> {
    await Database.client.end();
  }

  static async startTransaction(): Promise<void> {
    await Database.client.query('BEGIN');
  }

  static async commitTransaction(): Promise<void> {
    await Database.client.query('COMMIT');
  }

  static async rollbackTransaction(): Promise<void> {
    await Database.client.query('ROLLBACK');
  }

  static async prepareExcute<T>(args: {
    query: string,
    inputParams?: InputParameter,
  }): Promise<T> {
    try {
      const { query, inputParams } = args;

      const { query: newQuery, values } = setInputParams(query, inputParams);

      const result = await Database.client.query(newQuery, values);

      return result as T;
    } catch (error) {
      throw new Error(`
      ${error}

      query:
      ${args.query}

      inParam:
      ${JSON.stringify(args?.inputParams)}
    `);
    }
  }
}

export const initDatabase = async (request: express.Request, response: express.Response, next: express.NextFunction): Promise<void> => {
  Database.initDatabase();

  next();
}

export const releaseDatabse = async (request: express.Request, response: express.Response, next: express.NextFunction): Promise<void> => {
  await Database.release();

  next();
}
