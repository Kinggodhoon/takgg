import express from 'express';
import jwt from 'jsonwebtoken';

import { HttpException } from '../types/exception';
import Config from '../config/Config';
import { PlayerInfo } from '../application/players/model/players.model';

const authorizeValidate = (request: express.Request, response: express.Response, next: express.NextFunction) => {
  try {
    const token = request.headers.authorization?.split(' ');

    if (!token) {
      throw new HttpException(401, 'Invalid Authorization Token');
    }

    try {
      const payload = jwt.verify(token[1] as string, Config.getConfig().JWT_SECRET) as PlayerInfo;
      request.player = {
        playerId: payload.playerId,
        realName: payload.realName,
        displayName: payload.displayName,
        profileImage: payload.profileImage,
      };
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
