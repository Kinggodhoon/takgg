import express from 'express';
import jwt from 'jsonwebtoken';

import { HttpException } from '../types/exception';
import Config from '../config/Config';

const authorizeValidate = (request: express.Request, response: express.Response, next: express.NextFunction) => {
  try {
    const token = request.headers.authorization?.split(' ');

    if (!token) {
      throw new HttpException(401, 'Invalid Authorization Token');
    }

    try {
      jwt.verify(token[1] as string, Config.getConfig().JWT_SECRET);
    } catch (e) {
      // when token is expired or invalid token
      throw new HttpException(401, 'Invalid Authorization Token');
    }

    return next();
  } catch {
    return response.status(401).json({
      message: 'Invalid Authorization Token',
      data: null,
    });
  }
}

export default authorizeValidate;
