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
  let refinedQuery: string = query;
  const values: Array<any> = [];

  let valueCount = 0;
  if (inputParams) {
    Object.keys(inputParams).map((key) => {
      // query formatting
      refinedQuery = _.replace(refinedQuery, `@${key}`, `$${valueCount += 1}::${inputParams[key].type}`);
      values.push(inputParams[key].value);
    });
  }

  return {
    query: refinedQuery,
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
  }): Promise<Array<T> | null> {
    try {
      const { query, inputParams } = args;

      // query input parameter setting
      const { query: refinedQuery, values } = setInputParams(query, inputParams);

      // query execute
      const result = (await Database.client.query(refinedQuery, values)).rows;

      // null check
      if (result.length < 1) {
        return null;
      }

      // return array result
      return result as Array<T>;
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