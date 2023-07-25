import express from 'express';

import Controller from '../controller';
import { Database, initDatabase, releaseDatabase } from '../../database/database';
import response from '../../middleware/response';
import parameterValidate from '../../middleware/parameter.validate';
import { GetPlayerProfileRequest } from './model/players.model';
import PlayersService from './players.service';
import authorizeValidate from '../../middleware/authorize.validate';

class PlayersController extends Controller {
  public readonly path = '/players';

  private playersService: PlayersService;

  constructor() {
    super();
    this.initializeRoutes();

    this.playersService = new PlayersService();
  }

  private initializeRoutes() {
    // auth
    this.router.get(`${this.path}`, authorizeValidate, initDatabase, this.getPlayerList, releaseDatabase, response);
    this.router.get(`${this.path}/:playerId`, authorizeValidate, parameterValidate(GetPlayerProfileRequest), initDatabase, this.getPlayer, releaseDatabase, response);
  }

  private getPlayerList = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      const playerList = await this.playersService.getAllPlayerList();

      res.responseData = {
        code: 200,
        message: 'Success',
        data: playerList,
      }
    } catch (error) {
      console.log(error);
      res.responseError = error;
    }
    return next();
  }

  private getPlayer = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      const params = req.requestParams as GetPlayerProfileRequest;

      const playerProfile = await this.playersService.getPlayerProfile(params.playerId);

      res.responseData = {
        code: 200,
        message: 'Success',
        data: playerProfile,
      }
    } catch (error) {
      console.log(error);
      res.responseError = error;
    }
    return next();
  }
}

export default PlayersController;
