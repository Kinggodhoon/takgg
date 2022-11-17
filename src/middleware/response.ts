import express from 'express';

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

const getResponseMessage = async (code: number): Promise<string> => responseEnum[code]?.message;

// Response middleware
const response = async (request: express.Request, response: express.Response): Promise<void> => {
  const { responseData, responseError } = response;

  // Get error message
  let message;
  if (responseError && !responseData.message) {
    message = getResponseMessage(responseData.code);
  }

  // Send response
  response.status(responseData.code).json({
    message: message || responseData.message,
    data: responseData.data || null,
  });
}

export default response;
