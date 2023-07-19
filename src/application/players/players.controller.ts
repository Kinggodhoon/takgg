import express from 'express';

import Controller from '../controller';
import { Database, initDatabase, releaseDatabse } from '../../database/database';
import response from '../../middleware/response';
import parameterValidate from '../../middleware/parameter.validate';
import { AuthRequest } from './model/players.model';
import PlayersService from './players.service';

class PlayersController extends Controller {
  public readonly path = '/players';

  constructor() {
    super();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // auth
    this.router.post(`${this.path}/auth`, parameterValidate(AuthRequest), initDatabase, this.auth, releaseDatabse, response);
  }

  private auth = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      const params = req.requestParams as AuthRequest;

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
