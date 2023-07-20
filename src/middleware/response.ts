import express from 'express';
import { ResponseData } from '../types/express';

const responseEnum: { [key: string]: { message: string } } = {
  200: {
    message: 'Success',
  },
  400: {
    message: 'Bad Request',
  },
  401: {
    message: 'Invalid Authorization Token',
  },
  403: {
    message: 'Invalid Authentication',
  },
  404: {
    message: 'Not Found',
  },
  409: {
    message: 'Conflict',
  },
  418: {
    message: 'I\'m a teapot',
  },
  500: {
    message: 'Internal Server Error',
  },
};

const getResponseMessage = (code: number): string => responseEnum[code]?.message;

// Response middleware
const response = async (request: express.Request, response: express.Response): Promise<void> => {
  const { responseData, responseError } = response;
  // Successfully Response
  if (!responseError) {
    // Send response
    response.status(responseData?.code || 200).json({
      message: responseData?.message || 'Success',
      data: responseData?.data || null,
    });

    return;
  }

  // Error Response
  const errorResponse: ResponseData = {
    code: 500,
    message: 'Unknown server error',
    data: null,
  }
  if (responseError.code) {
    Object.assign(errorResponse, {
      code: responseError.code,
      message: getResponseMessage(responseError.code) || responseError.message,
    });
  }

  // Send response
  response.status(errorResponse.code!).json({
    message: errorResponse.message,
    data: null,
  });
}

export default response;
