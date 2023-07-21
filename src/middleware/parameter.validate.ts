import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import express, { RequestHandler } from 'express';
import _ from 'lodash';

export interface Type<T = any> extends Function {
  new(...args: any[]): T;
}

const transform = <T>(Class: Type<T>, requestParams: { [key: string]: any }): Object => {
  const transformed = plainToInstance(Class, requestParams);

  return transformed as Object;
};

const parameterValidate = <T>(dto: Type<T>): RequestHandler => async (request: express.Request, response: express.Response, next: express.NextFunction): Promise<any> => {
  try {
    const { body, params, query } = request;
    const requestParams = _.merge(body, params, query);

    const requestDto = transform(dto, requestParams);

    const validated = await validate(requestDto);
    if (validated.length > 0) {
      throw new Error('Invalid Parameter Error');
    }

    request.requestParams = requestDto;

    return next();
  } catch {
    return response.status(400).json({
      message: 'Invalid request parameter',
      data: null,
    });
  }
}

export default parameterValidate;
