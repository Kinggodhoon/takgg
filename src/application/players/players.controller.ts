import express from 'express';

import Controller from '../controller';
import { Database, initDatabase, releaseDatabase } from '../../database/database';
import response from '../../middleware/response';
import parameterValidate from '../../middleware/parameter.validate';
import { GetPlayerProfileRequest, UpdatePlayerProfileRequest } from './model/players.model';
import PlayersService from './players.service';
import authorizeValidate from '../../middleware/authorize.validate';
import { HttpException } from '../../types/exception';
import GamesService from '../games/games.service';

class PlayersController extends Controller {
  public readonly path = '/players';

  private playersService: PlayersService;
  private gamesService: GamesService;

  constructor() {
    super();
    this.initializeRoutes();

    this.playersService = new PlayersService();
    this.gamesService = new GamesService();
  }

  private initializeRoutes() {
    // Get all players
    this.router.get(`${this.path}`, authorizeValidate, initDatabase, this.getPlayerList, response, releaseDatabase);
    // Get player
    this.router.get(`${this.path}/:playerId`, authorizeValidate, parameterValidate(GetPlayerProfileRequest), initDatabase, this.getPlayer, response, releaseDatabase);
    // Update player profile
    this.router.patch(`${this.path}`, authorizeValidate, parameterValidate(UpdatePlayerProfileRequest), initDatabase, this.updatePlayerProfile, response);
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
      const matchStat = await this.gamesService.getCountOfMatchHistory(params.playerId);
      if (!playerProfile) throw new HttpException(404, 'Player Not Found');

      res.responseData = {
        code: 200,
        message: 'Success',
        data: {
          matchStat,
          ...playerProfile,
        },
      }
    } catch (error) {
      console.log(error);
      res.responseError = error;
    }
    return next();
  }

  private updatePlayerProfile = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      const params = req.requestParams as UpdatePlayerProfileRequest;
      // all of columns undefined
      if (Object.values(params).every((e) => !e)) throw new HttpException(400, 'Invalid Parameter Error');

      const { player } = req;
      try {
        await Database.startTransaction();

        await this.playersService.updatePlayerProfile(player.playerId, params);

        await Database.commitTransaction();
      } catch {
        await Database.rollbackTransaction();
        throw new HttpException(409, 'Update Player Profile Error');
      }

      const playerProfile = await this.playersService.getPlayerProfile(player.playerId);

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
