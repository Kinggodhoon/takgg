import express from 'express';
import _ from 'lodash';

import Controller from '../controller';
import { Database, initDatabase, releaseDatabase } from '../../database/database';
import response from '../../middleware/response';
import parameterValidate from '../../middleware/parameter.validate';
import { SubmitGameResultRequest } from './model/games.model';
import PlayersService from '../players/players.service';
import authorizeValidate from '../../middleware/authorize.validate';
import { HttpException } from '../../types/exception';

class GamesController extends Controller {
  public readonly path = '/games';

  private playersService: PlayersService;

  constructor() {
    super();
    this.initializeRoutes();

    this.playersService = new PlayersService();
  }

  private initializeRoutes() {
    // auth
    this.router.post(`${this.path}`, authorizeValidate, parameterValidate(SubmitGameResultRequest), initDatabase, this.submitGameResult, releaseDatabase, response);
  }

  private submitGameResult = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      const params = req.requestParams as SubmitGameResultRequest;
      const gameResultList = _.sortBy(params.resultList, 'score').reverse();

      if (
        gameResultList[0].playerId === gameResultList[1].playerId // same user request
        || gameResultList[0].score === gameResultList[1].score // same score request
        || (gameResultList[0].score < 10 && gameResultList[1].score < 10) // unfinished game request
        || (gameResultList[0].score - gameResultList[1].score < 2) // du
      ) {
        throw new HttpException(401, 'Invalid Parameter Error');
      }

      // const matchedPlayers = await this.playersService.getPlayerInfoList(params.playerList.map((p) => p.playerId));
      // console.log(matchedPlayers);

      res.responseData = {
        code: 200,
        message: 'Success',
        data: req.requestParams,
      }
    } catch (error) {
      console.log(error);
    }
    return next();
  }
}

export default GamesController;
