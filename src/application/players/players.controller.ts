import express from 'express';

import Controller from '../controller';
import { Database, initDatabase, releaseDatabse } from '../../database/database';
import response from '../../middleware/response';
import parameterValidate from '../../middleware/parameter.validate';
import { RegisterRequest } from './model/players.model';
import PlayersService from './players.service';

class PlayersController extends Controller {
  public readonly path = '/players';

  constructor() {
    super();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // auth
    this.router.post(`${this.path}/auth/register`, parameterValidate(RegisterRequest), initDatabase, this.register, releaseDatabse, response);
  }

  private register = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      const params = req.requestParams as RegisterRequest;

      const playersService = new PlayersService();

      await Database.startTransaction();

      const playerInfo = await playersService.getPlayerByEmail(params.email);

      res.responseData = {
        code: 200,
        message: 'Success',
        data: params,
      }
    } catch (error) {
      console.log(error);
    }
    return next();
  }
}

export default PlayersController;
