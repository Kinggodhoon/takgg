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
import GamesService from './games.service';
import SlackService from '../slack/slack.service';

class GamesController extends Controller {
  public readonly path = '/games';

  private playersService: PlayersService;
  private gamesService: GamesService;
  private slackService: SlackService;

  constructor() {
    super();
    this.initializeRoutes();

    this.playersService = new PlayersService();
    this.gamesService = new GamesService();
    this.slackService = new SlackService();
  }

  private initializeRoutes() {
    // auth
    this.router.post(`${this.path}`, authorizeValidate, parameterValidate(SubmitGameResultRequest), initDatabase, this.submitGameResult, releaseDatabase, response);
  }

  private submitGameResult = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      const params = req.requestParams as SubmitGameResultRequest;

      const playerRatingList = await this.playersService.getPlayerRatingList(params.resultList.map((r) => r.playerId));
      if (playerRatingList.length < 2) throw new HttpException(400, 'Invalid Parameter Error');

      // sort by score desc
      const gameResultList = _.sortBy(params.resultList, 'score').reverse();

      const calculatedRatings = this.gamesService.calculateRating(gameResultList[0].playerId === playerRatingList[0].playerId
        ? {
          winner: playerRatingList[0],
          loser: playerRatingList[1],
        } // winner index 0
        : {
          winner: playerRatingList[1],
          loser: playerRatingList[0],
        }); // winner index 1

      // Insert game results and send message
      let gameId: number;
      try {
        Database.startTransaction();
        // Insert game result
        gameId = await this.gamesService.insertGameResult(calculatedRatings.winner.playerId, calculatedRatings.loser.playerId, gameResultList);

        // Insert rating history
        await this.gamesService.insertRatingHistories(gameId, calculatedRatings.winner, calculatedRatings.loser);

        // Send slack message for validating
        const receiverRating = playerRatingList[0].playerId !== req.player.playerId ? playerRatingList[0] : playerRatingList[1];
        await this.slackService.sendGameValidateMessage(gameId, gameResultList, req.player.displayName, {
          playerId: receiverRating.playerId,
          displayName: receiverRating.displayName,
        });
        Database.commitTransaction();
      } catch {
        Database.rollbackTransaction();
        throw new HttpException(409, 'Save Game Result Error');
      }

      res.responseData = {
        code: 200,
        message: 'Success',
        data: gameResultList,
      }
    } catch (error) {
      console.log(error);
      res.responseError = error;
    }
    return next();
  }
}

export default GamesController;
