import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import express from 'express';
import _ from 'lodash';

export interface Type<T = any> extends Function {
  new(...args: any[]): T;
}

const transform = async <T>(Class: Type<T>, requestParams: any): Promise<T> => {
  const transformed = plainToInstance(Class, requestParams);

  return transformed;
};

// Response middleware
const parameterValidate = async <T>(
  request: express.Request,
  response: express.Response,
  next: express.NextFunction,
  type: Type<T>,
): Promise<any> => {
  try {
    const { body, params, query } = request;
    const requestParams = _.merge(body, params, query);

    const requestDto = transform(type, requestParams);

    const validated = await validate(requestDto);
    if (validated.length > 0) {
      throw new Error('Invalid Parameter Error');
    }

    request.requestParams = requestDto;

    return next();
  } catch (e) {
    return response.status(400).json({
      message: 'Invalid request parameter',
      data: null,
    });
  }
}

export default parameterValidate;
